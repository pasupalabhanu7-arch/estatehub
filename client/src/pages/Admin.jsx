import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, formatPrice } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Admin() {
  const { user: me } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [s, u, p] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/properties', { params: { limit: 50 } }),
      ]);
      setStats(s.data);
      setUsers(u.data.items);
      setProperties(p.data.items);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  useEffect(() => { load(); }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their listings?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const deleteProperty = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/properties/${id}`);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <>
      <h2 className="section-title">Admin panel</h2>
      {error && <p className="alert error">{error}</p>}

      {stats && (
        <div className="stats">
          <div><strong>{stats.users}</strong><span>Users</span></div>
          <div><strong>{stats.properties}</strong><span>Listings</span></div>
          <div><strong>{stats.available}</strong><span>Available</span></div>
          <div><strong>{stats.closed}</strong><span>Sold / rented</span></div>
          <div><strong>{stats.inquiries}</strong><span>Inquiries</span></div>
        </div>
      )}

      <h3>Users</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td className="cap">{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  {u._id !== me._id && <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>All listings</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Owner</th><th>City</th><th>Price</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p._id}>
                <td><Link to={`/properties/${p._id}`}>{p.title}</Link></td>
                <td>{p.owner?.name}</td>
                <td>{p.location?.city}</td>
                <td>{formatPrice(p.price, p.listingType)}</td>
                <td className="cap">{p.status}</td>
                <td className="actions-cell">
                  <Link className="btn btn-outline btn-sm" to={`/dashboard/edit/${p._id}`}>Edit</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteProperty(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
