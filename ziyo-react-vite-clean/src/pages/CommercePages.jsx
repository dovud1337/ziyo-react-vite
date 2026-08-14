import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import { useApp } from '../context/AppContext.jsx';
import { coupons } from '../data/coupons.js';
import { getEffectivePrice, hasDiscount } from '../utils/courseHelpers.js';

export function CartPage() {
  const { courses, cartIds, removeFromCart } = useApp();
  const navigate = useNavigate();
  const items = courses.filter((course) => cartIds.includes(course.id));
  const total = items.reduce((sum, course) => sum + getEffectivePrice(course), 0);

  if (items.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Покупки" title="Корзина" description="Выбранные курсы перед оплатой." />
        <div className="panel empty-state">
          <h2>Корзина пуста</h2>
          <p>Добавьте курс из каталога, чтобы продолжить.</p>
          <Link className="button button--primary" to="/catalog">Перейти в каталог</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Покупки" title="Корзина" description="Выбранные курсы перед оплатой." />
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Курс</th><th>Преподаватель</th><th>Цена</th><th></th></tr></thead>
          <tbody>
            {items.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.teacher}</td>
                <td>
                  {hasDiscount(course) && <span className="price-original">{course.price} TJS</span>}
                  {getEffectivePrice(course)} TJS
                </td>
                <td><Button variant="secondary" onClick={() => removeFromCart(course.id)}>Удалить</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="section purchase-card" style={{ maxWidth: 320 }}>
        <strong>Итого: {total} TJS</strong>
        <Button onClick={() => navigate('/checkout')}>Оформить заказ</Button>
      </section>
    </>
  );
}

export function CheckoutPage() {
  const { courses, cartIds, enrollCartItems } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', card: '', expiry: '' });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  if (cartIds.length === 0) {
    return <Navigate to="/cart" replace />;
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
      setCouponError('Промокод не найден.');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const enrolled = enrollCartItems();
    navigate('/payment-success', { state: { titles: enrolled.map((course) => course.title) } });
  };

  return (
    <>
      <PageHeader eyebrow="Покупки" title="Оплата" description="Выберите способ оплаты и подтвердите заказ." />
      <div className="panel table-wrap">
        <table>
          <thead><tr><th>Курс</th><th>Цена</th></tr></thead>
          <tbody>
            {items.map((course) => <tr key={course.id}><td>{course.title}</td><td>{getEffectivePrice(course)} TJS</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="panel form" style={{ maxWidth: 420 }}>
        <label>Промокод (попробуйте SALE10, SALE20, ZIYO50)
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="Промокод" />
            <Button type="button" variant="secondary" onClick={handleApplyCoupon}>Применить</Button>
          </div>
        </label>
        {couponError && <p style={{ color: '#c0392b' }}>{couponError}</p>}
        {appliedCoupon && <p style={{ color: 'var(--green)' }}>Промокод {appliedCoupon} применён: -{discountPercent}%</p>}
        <p>Сумма: {subtotal} TJS</p>
        {discountAmount > 0 && <p>Скидка: -{discountAmount} TJS</p>}
        <strong>Итого: {total} TJS</strong>
      </div>

      <form className="panel form" onSubmit={handleSubmit}>
        <label>Имя на карте<input required value={form.name} onChange={handleChange('name')} placeholder="Довуд Каримов" /></label>
        <label>Номер карты<input required value={form.card} onChange={handleChange('card')} placeholder="0000 0000 0000 0000" /></label>
        <label>Срок действия<input required value={form.expiry} onChange={handleChange('expiry')} placeholder="ММ/ГГ" /></label>
        <Button type="submit">Оплатить {total} TJS</Button>
      </form>
    </>
  );
}

export function PaymentSuccessPage() {
  const location = useLocation();
  const titles = location.state?.titles ?? [];

  return (
    <>
      <PageHeader eyebrow="Покупки" title="Оплата прошла успешно" description="Курс добавлен в ваш кабинет." />
      <div className="panel empty-state">
        <h2>Спасибо за покупку!</h2>
        {titles.length > 0 ? (
          <ul className="check-list">
            {titles.map((title) => <li key={title}>{title}</li>)}
          </ul>
        ) : (
          <p>Курсы добавлены в раздел «Мои курсы».</p>
        )}
        <Link className="button button--primary" to="/student/courses">Перейти к моим курсам</Link>
      </div>
    </>
  );
}
