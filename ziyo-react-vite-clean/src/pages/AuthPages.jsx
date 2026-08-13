import Button from '../components/Button.jsx';

export default function AuthPage({ mode }) {
  const content = {
    login: ['Войти', 'Нет аккаунта?', '/register', 'Зарегистрироваться'],
    register: ['Создать аккаунт', 'Уже есть аккаунт?', '/login', 'Войти'],
    forgot: ['Восстановить пароль', 'Вспомнили пароль?', '/login', 'Войти'],
  }[mode];

  return (
    <div className="auth-page">
      <form className="auth-card panel">
        <a href="/" className="logo">ZIYO</a>
        <h1>{content[0]}</h1>
        {mode === 'register' && <label>Имя<input /></label>}
        <label>Email<input type="email" /></label>
        {mode !== 'forgot' && <label>Пароль<input type="password" /></label>}
        <Button type="submit">Продолжить</Button>
        <p>{content[1]} <a href={content[2]}>{content[3]}</a></p>
      </form>
    </div>
  );
}
