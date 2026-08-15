import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import { useApp } from '../store/appStore.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { coupons } from '../data/coupons.js';
import { getEffectivePrice, hasDiscount } from '../utils/courseHelpers.js';

export function CartPage() {
  const { courses, cartIds, removeFromCart } = useApp((state) => ({
    courses: state.courses, cartIds: state.cartIds, removeFromCart: state.removeFromCart,
  }));
  const { t } = useLanguage();
  const navigate = useNavigate();
  const items = courses.filter((course) => cartIds.includes(course.id));
  const total = items.reduce((sum, course) => sum + getEffectivePrice(course), 0);

  if (items.length === 0) {
    return (
      <>
        <PageHeader eyebrow={t('cart.purchases')} title={t('cart.cartTitle')} description={t('cart.cartDescription')} />
        <div className="panel empty-state">
          <h2>{t('cart.emptyCart')}</h2>
          <p>{t('cart.addFromCatalog')}</p>
          <Link className="button button--primary" to="/catalog">{t('common.goToCatalog')}</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow={t('cart.purchases')} title={t('cart.cartTitle')} description={t('cart.cartDescription')} />
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>{t('cart.courseColumn')}</th><th>{t('cart.teacherColumn')}</th><th>{t('cart.priceColumn')}</th><th></th></tr></thead>
          <tbody>
            {items.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.teacher}</td>
                <td>
                  {hasDiscount(course) && <span className="price-original">{course.price} TJS</span>}
                  {getEffectivePrice(course)} TJS
                </td>
                <td><Button variant="secondary" onClick={() => removeFromCart(course.id)}>{t('cart.remove')}</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="section purchase-card" style={{ maxWidth: 320 }}>
        <strong>{t('cart.total', { total })}</strong>
        <Button onClick={() => navigate('/checkout')}>{t('cart.checkout')}</Button>
      </section>
    </>
  );
}

export function CheckoutPage() {
  const { courses, cartIds, enrollCartItems, userDataLoaded } = useApp((state) => ({
    courses: state.courses, cartIds: state.cartIds, enrollCartItems: state.enrollCartItems, userDataLoaded: state.userDataLoaded,
  }));
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', card: '', expiry: '' });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (cartIds.length === 0) {
    return userDataLoaded ? <Navigate to="/cart" replace /> : null;
  }

  const items = courses.filter((course) => cartIds.includes(course.id));
  const subtotal = items.reduce((sum, course) => sum + getEffectivePrice(course), 0);
  const discountPercent = appliedCoupon ? coupons[appliedCoupon] : 0;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const total = subtotal - discountAmount;

  const handleChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleApplyCoupon = (event) => {
    event.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (coupons[code]) {
      setAppliedCoupon(code);
      setCouponError('');
    } else {
      setAppliedCoupon(null);
      setCouponError(t('checkout.couponNotFound'));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const enrolled = await enrollCartItems();
      navigate('/payment-success', { state: { titles: enrolled.map((course) => course.title) } });
    } catch (err) {
      setSubmitError(err.message ?? t('checkout.orderFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow={t('cart.purchases')} title={t('checkout.paymentTitle')} description={t('checkout.paymentDescription')} />
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>{t('cart.courseColumn')}</th><th>{t('cart.priceColumn')}</th></tr></thead>
          <tbody>
            {items.map((course) => <tr key={course.id}><td>{course.title}</td><td>{getEffectivePrice(course)} TJS</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="panel form" style={{ maxWidth: 420 }}>
        <label>{t('checkout.couponLabel')}
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder={t('checkout.couponPlaceholder')} />
            <Button type="button" variant="secondary" onClick={handleApplyCoupon}>{t('checkout.apply')}</Button>
          </div>
        </label>
        {couponError && <p style={{ color: '#c0392b' }}>{couponError}</p>}
        {appliedCoupon && <p style={{ color: 'var(--green)' }}>{t('checkout.couponApplied', { code: appliedCoupon, percent: discountPercent })}</p>}
        <p>{t('checkout.amount', { amount: subtotal })}</p>
        {discountAmount > 0 && <p>{t('checkout.discount', { amount: discountAmount })}</p>}
        <strong>{t('checkout.total', { total })}</strong>
      </div>

      <form className="panel form" onSubmit={handleSubmit}>
        <label>{t('checkout.nameOnCard')}<input required value={form.name} onChange={handleChange('name')} placeholder="Довуд Каримов" /></label>
        <label>{t('checkout.cardNumber')}<input required value={form.card} onChange={handleChange('card')} placeholder="0000 0000 0000 0000" /></label>
        <label>{t('checkout.expiry')}<input required value={form.expiry} onChange={handleChange('expiry')} placeholder={t('checkout.expiryPlaceholder')} /></label>
        {submitError && <p style={{ color: '#c0392b' }}>{submitError}</p>}
        <Button type="submit" disabled={submitting}>{submitting ? t('checkout.paying') : t('checkout.pay', { total })}</Button>
      </form>
    </>
  );
}

export function PaymentSuccessPage() {
  const location = useLocation();
  const { t } = useLanguage();
  const titles = location.state?.titles ?? [];

  return (
    <>
      <PageHeader eyebrow={t('cart.purchases')} title={t('paymentSuccess.title')} description={t('paymentSuccess.description')} />
      <div className="panel empty-state">
        <h2>{t('paymentSuccess.thanks')}</h2>
        {titles.length > 0 ? (
          <ul className="check-list">
            {titles.map((title) => <li key={title}>{title}</li>)}
          </ul>
        ) : (
          <p>{t('paymentSuccess.addedToMyCourses')}</p>
        )}
        <Link className="button button--primary" to="/student/courses">{t('paymentSuccess.goToMyCourses')}</Link>
      </div>
    </>
  );
}
