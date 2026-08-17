// Edge Function: create-bunny-upload
// Creates a Bunny Stream video object and returns a signed upload pass to the
// client, without ever exposing the Bunny API key to the browser.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  // 1. CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 2. Only POST with { title: string } is accepted
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let title: unknown;
  try {
    const body = await req.json();
    title = body?.title;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (typeof title !== "string" || title.trim() === "") {
    return jsonResponse({ error: "\"title\" is required and must be a non-empty string" }, 400);
  }

  // 3. Read secrets from the environment — never hardcode them
  const apiKey = Deno.env.get("BUNNY_API_KEY");
  const libraryId = Deno.env.get("BUNNY_LIBRARY_ID");

  if (!apiKey || !libraryId) {
    return jsonResponse(
      { error: "Server misconfiguration: BUNNY_API_KEY or BUNNY_LIBRARY_ID is not set" },
      500,
    );
  }

  // 4. Create the video object in Bunny Stream
  const createResponse = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    return jsonResponse(
      { error: `Bunny API error (${createResponse.status}): ${errorText}` },
      502,
    );
  }

  const created = await createResponse.json();
  const guid: string | undefined = created?.guid;

  if (!guid) {
    return jsonResponse({ error: "Bunny API response did not include a video guid" }, 502);
  }

  // 5. Build the signed upload pass
  const expiration = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const signature = await sha256Hex(`${libraryId}${apiKey}${expiration}${guid}`);

  // 6. Hand the client everything it needs to upload directly to Bunny
  return jsonResponse(
    {
      libraryId,
      videoGuid: guid,
      signature,
      expiration,
    },
    200,
  );
});
