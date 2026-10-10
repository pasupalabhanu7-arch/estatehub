import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(errMsg(err));
    }
    setBusy(false);
  };

  return (
    <form className="auth-box" onSubmit={submit}>
      <h2>Login</h2>
      {error && <p className="alert error">{error}</p>}
      <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
      <p className="muted">New here? <Link to="/register">Create an account</Link></p>
      <p className="muted small">Demo: owner@estatehub.com / owner123 &nbsp;|&nbsp; buyer@estatehub.com / buyer123 &nbsp;|&nbsp; admin@estatehub.com / admin123</p>
    </form>
  );
}
