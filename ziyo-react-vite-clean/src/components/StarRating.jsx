export default function StarRating({ value = 0, max = 5, interactive = false, onChange }) {
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  return (
    <span className={`star-rating${interactive ? ' star-rating--interactive' : ''}`}>
      {stars.map((star) => (
        <span
          key={star}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          className={star <= Math.round(value) ? 'star star--filled' : 'star'}
          onClick={interactive ? () => onChange?.(star) : undefined}
        >
          ★
        </span>
      ))}
    </span>
  );
}
