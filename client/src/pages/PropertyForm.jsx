import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';

const empty = {
  title: '', description: '', price: '', listingType: 'sale', propertyType: 'apartment',
  status: 'available', bedrooms: 0, bathrooms: 0, area: 0,
  address: '', city: '', state: '', images: '',
};

export default function PropertyForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!editing) return;
    api.get(`/properties/${id}`)
      .then(({ data: p }) => {
        setForm({
          title: p.title, description: p.description, price: p.price,
          listingType: p.listingType, propertyType: p.propertyType, status: p.status,
          bedrooms: p.bedrooms, bathrooms: p.bathrooms, area: p.area,
          address: p.location?.address || '', city: p.location?.city || '', state: p.location?.state || '',
          images: (p.images || []).join('\n'),
        });
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      listingType: form.listingType,
      propertyType: form.propertyType,
      status: form.status,
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      area: Number(form.area),
      location: { address: form.address, city: form.city, state: form.state },
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing) await api.put(`/properties/${id}`, payload);
      else await api.post('/properties', payload);
      navigate('/dashboard');
    } catch (err) {
      setError(errMsg(err));
    }
    setBusy(false);
  };

  if (loading) return <p className="muted">Loading...</p>;

  return (
    <form className="form-box" onSubmit={submit}>
      <h2>{editing ? 'Edit property' : 'Add new property'}</h2>
      {error && <p className="alert error">{error}</p>}

      <label>Title<input required value={form.title} onChange={set('title')} /></label>
      <label>Description<textarea required rows="4" value={form.description} onChange={set('description')} /></label>

      <div className="two-col">
        <label>Listing type
          <select value={form.listingType} onChange={set('listingType')}>
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </label>
        <label>Property type
          <select value={form.propertyType} onChange={set('propertyType')}>
            {['apartment', 'house', 'villa', 'plot', 'commercial'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>Price (₹{form.listingType === 'rent' ? ' per month' : ''})
          <input type="number" min="0" required value={form.price} onChange={set('price')} />
        </label>
        <label>Status
          <select value={form.status} onChange={set('status')}>
            <option value="available">available</option>
            <option value="sold">sold</option>
            <option value="rented">rented</option>
          </select>
        </label>
        <label>Bedrooms<input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} /></label>
        <label>Bathrooms<input type="number" min="0" value={form.bathrooms} onChange={set('bathrooms')} /></label>
        <label>Area (sq ft)<input type="number" min="0" value={form.area} onChange={set('area')} /></label>
        <label>City<input required value={form.city} onChange={set('city')} /></label>
        <label>State<input value={form.state} onChange={set('state')} /></label>
        <label>Address / area<input value={form.address} onChange={set('address')} /></label>
      </div>

      <label>Image URLs (one per line)
        <textarea rows="3" placeholder="https://..." value={form.images} onChange={set('images')} />
      </label>

      <div className="actions">
        <button className="btn" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Create listing'}</button>
        <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>Cancel</button>
      </div>
    </form>
  );
}
