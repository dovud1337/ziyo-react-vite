export default function Button({ children, variant = 'primary', type = 'button', onClick, disabled = false }) {
  return (
    <button type={type} className={`button button--${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
