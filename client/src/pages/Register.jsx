import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'buyer' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await register(form);
      navigate(user.role === 'owner' ? '/dashboard' : '/');
    } catch (err) {
      setError(errMsg(err));
    }
    setBusy(false);
  };

  return (
    <form className="auth-box" onSubmit={submit}>
      <h2>Create account</h2>
      {error && <p className="alert error">{error}</p>}
      <label>Full name<input required value={form.name} onChange={set('name')} /></label>
      <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
      <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
      <label>Password (min 6 characters)<input type="password" minLength="6" required value={form.password} onChange={set('password')} /></label>
      <label>I want to
        <select value={form.role} onChange={set('role')}>
          <option value="buyer">Buy or rent a property</option>
          <option value="owner">List my properties</option>
        </select>
      </label>
      <button className="btn" disabled={busy}>{busy ? 'Creating...' : 'Sign up'}</button>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
