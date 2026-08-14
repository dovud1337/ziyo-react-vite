import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { login, register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const content = {
    login: ['Войти', 'Нет аккаунта?', '/register', 'Зарегистрироваться'],
    register: ['Создать аккаунт', 'Уже есть аккаунт?', '/login', 'Войти'],
    forgot: ['Восстановить пароль', 'Вспомнили пароль?', '/login', 'Войти'],
  }[mode];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (mode === 'forgot') {
      setSent(true);
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/student');
    } catch (err) {
      setError(err.message ?? 'Что-то пошло не так. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__theme"><ThemeToggle /></div>
      <form className="auth-card panel" onSubmit={handleSubmit}>
        <Link to="/" className="logo">ZIYO</Link>
        <h1>{content[0]}</h1>
        {mode === 'forgot' && sent ? (
          <p>Инструкции по восстановлению пароля отправлены на {email}.</p>
        ) : (
          <>
            {mode === 'register' && (
              <label>Имя<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
            )}
            <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            {mode !== 'forgot' && (
              <label>Пароль<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            )}
            {error && <p style={{ color: '#c0392b' }}>{error}</p>}
            <Button type="submit" disabled={submitting}>{submitting ? 'Подождите…' : 'Продолжить'}</Button>
          </>
        )}
        <p>{content[1]} <Link to={content[2]}>{content[3]}</Link></p>
      </form>
    </div>
  );
}
