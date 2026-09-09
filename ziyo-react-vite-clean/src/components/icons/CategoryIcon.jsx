const TONE_BY_CATEGORY = {
  'Программирование': 'code',
  'Дизайн': 'design',
  'Маркетинг': 'marketing',
  'Языки': 'languages',
  'AI': 'ai',
  'Бизнес': 'business',
  'Аналитика': 'analytics',
  'Контент': 'content',
};

export function getCategoryToneKey(category) {
  return TONE_BY_CATEGORY[category] ?? 'content';
}

const PATHS_BY_TONE = {
  code: <path d="M8 6L3 12l5 6M16 6l5 6-5 6" />,
  design: (
    <>
      <path d="M3 21l4.4-1.1L18.6 8.6a1.7 1.7 0 0 0 0-2.4l-.9-.9a1.7 1.7 0 0 0-2.4 0L4.1 16.5 3 21z" />
      <path d="M13.4 6.5l3 3" />
    </>
  ),
  marketing: (
    <>
      <path d="M3 10v4h3l10 5V5L6 10H3z" />
      <path d="M17 9a3 3 0 0 1 0 6" />
    </>
  ),
  languages: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.5 3.7 6 3.7 9s-1.3 6.5-3.7 9c-2.4-2.5-3.7-6-3.7-9s1.3-6.5 3.7-9z" />
    </>
  ),
  ai: <path d="M12 3l1.8 5.6 5.9 1.4-5.9 1.4L12 17.4l-1.8-5.6-5.9-1.4 5.9-1.4z" />,
  business: (
    <>
      <rect x="3" y="8" width="18" height="11" rx="2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </>
  ),
  analytics: <path d="M4 20V11M12 20V4M20 20v-8" />,
  content: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
};

export default function CategoryIcon({ category, size = 32 }) {
  const tone = getCategoryToneKey(category);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS_BY_TONE[tone]}
    </svg>
  );
}
