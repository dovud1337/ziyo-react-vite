import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';
import SeoHead from '../components/SeoHead.jsx';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, resetPassword, updatePassword } = useApp((state) => ({
    login: state.login, register: state.register, resetPassword: state.resetPassword, updatePassword: state.updatePassword,
  }));
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setSent(false); setError(''); setPassword(''); }, [mode]);

  const content = {
    login: [t('auth.login'), t('auth.noAccount'), '/register', t('auth.signUp')],
    register: [t('auth.createAccount'), t('auth.alreadyHaveAccount'), '/login', t('auth.login')],
    forgot: [t('auth.restorePassword'), t('auth.rememberedPassword'), '/login', t('auth.login')],
    reset: [t('auth.newPassword'), t('auth.rememberedPassword'), '/login', t('auth.login')],
  }[mode];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'forgot') {
        await resetPassword(email);
        setSent(true);
        return;
      } else if (mode === 'reset') {
        await updatePassword(password);
      } else if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate(location.state?.from ?? '/student');
    } catch (err) {
      setError(err.message ?? t('auth.genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <SeoHead title={content[0]} />
      <div className="auth-page__theme"><LanguageSwitcher /><ThemeToggle /></div>
      <form className="auth-card panel" onSubmit={handleSubmit}>
        <Link to="/" className="logo">NOOR</Link>
        <h1>{content[0]}</h1>
        {mode === 'forgot' && sent ? (
          <p>{t('auth.resetInstructionsSent', { email })}</p>
        ) : (
          <>
            {mode === 'register' && (
              <label>{t('auth.name')}<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
            )}
            {mode !== 'reset' && <label>{t('auth.email')}<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>}
            {mode !== 'forgot' && (
              <label>{t('auth.password')}<input required type="password" minLength={mode === 'login' ? undefined : 6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            )}
            {error && <p className="error-message">{error}</p>}
            <Button type="submit" disabled={submitting}>{submitting ? t('auth.pleaseWait') : t('auth.continueBtn')}</Button>
          </>
        )}
        <p>{content[1]} <Link to={content[2]}>{content[3]}</Link></p>
        {mode === 'login' && <Link to="/forgot-password">{t('auth.restorePassword')}</Link>}
      </form>
    </div>
  );
}
