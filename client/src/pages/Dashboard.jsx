import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, formatPrice } from '../api.js';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [mine, inq] = await Promise.all([api.get('/properties/mine'), api.get('/inquiries/received')]);
      setItems(mine.data.items);
      setInquiries(inq.data.items);
    } catch (e) {
      setError(errMsg(e));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setItems((list) => list.filter((p) => p._id !== id));
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const changeStatus = async (p, status) => {
    try {
      const { data } = await api.put(`/properties/${p._id}`, { status });
      setItems((list) => list.map((x) => (x._id === p._id ? { ...x, status: data.status } : x)));
    } catch (e) {
      setError(errMsg(e));
    }
  };

  if (loading) return <p className="muted">Loading...</p>;

  return (
    <>
      <div className="row-between">
        <h2 className="section-title">My listings</h2>
        <Link to="/dashboard/new" className="btn">+ Add property</Link>
      </div>
      {error && <p className="alert error">{error}</p>}

      {items.length === 0 ? (
        <p className="muted">You have no listings yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Title</th><th>City</th><th>Type</th><th>Price</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td><Link to={`/properties/${p._id}`}>{p.title}</Link></td>
                  <td>{p.location?.city}</td>
                  <td className="cap">{p.listingType}</td>
                  <td>{formatPrice(p.price, p.listingType)}</td>
                  <td>
                    <select value={p.status} onChange={(e) => changeStatus(p, e.target.value)}>
                      <option value="available">available</option>
                      <option value="sold">sold</option>
                      <option value="rented">rented</option>
                    </select>
                  </td>
                  <td className="actions-cell">
                    <Link className="btn btn-outline btn-sm" to={`/dashboard/edit/${p._id}`}>Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="section-title">Inquiries received</h2>
      {inquiries.length === 0 ? (
        <p className="muted">No inquiries yet.</p>
      ) : (
        <div className="inquiries">
          {inquiries.map((i) => (
            <div className="box" key={i._id}>
              <strong>{i.from?.name}</strong> on <em>{i.property?.title || 'a removed listing'}</em>
              <p>{i.message}</p>
              <p className="muted small">
                {i.from?.email}{i.from?.phone ? ` | ${i.from.phone}` : ''} | {new Date(i.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
