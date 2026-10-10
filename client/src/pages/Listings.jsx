import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import PropertyCard from '../components/PropertyCard.jsx';

const FIELDS = ['q', 'city', 'listingType', 'propertyType', 'status', 'minPrice', 'maxPrice', 'bedrooms', 'sort'];

export default function Listings() {
  const [params, setParams] = useSearchParams();
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map((k) => [k, params.get(k) || ''])));
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const page = Number(params.get('page')) || 1;

  // Fetch whenever the URL query changes
  useEffect(() => {
    setLoading(true);
    setError('');
    const query = { page, limit: 9 };
    FIELDS.forEach((k) => { if (params.get(k)) query[k] = params.get(k); });
    api.get('/properties', { params: query })
      .then(({ data }) => setData(data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const apply = (e) => {
    e.preventDefault();
    const next = {};
    FIELDS.forEach((k) => { if (form[k]) next[k] = form[k]; });
    setParams(next);
  };

  const reset = () => {
    setForm(Object.fromEntries(FIELDS.map((k) => [k, ''])));
    setParams({});
  };

  const goPage = (p) => {
    const next = Object.fromEntries(params.entries());
    next.page = String(p);
    setParams(next);
  };

  return (
    <>
      <h2 className="section-title">Browse properties</h2>
      <form className="filters" onSubmit={apply}>
        <input placeholder="Search keyword" value={form.q} onChange={set('q')} />
        <input placeholder="City" value={form.city} onChange={set('city')} />
        <select value={form.listingType} onChange={set('listingType')}>
          <option value="">Sale or Rent</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
        <select value={form.propertyType} onChange={set('propertyType')}>
          <option value="">All types</option>
          {['apartment', 'house', 'villa', 'plot', 'commercial'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={form.status} onChange={set('status')}>
          <option value="">Any status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>
        <input type="number" min="0" placeholder="Min price" value={form.minPrice} onChange={set('minPrice')} />
        <input type="number" min="0" placeholder="Max price" value={form.maxPrice} onChange={set('maxPrice')} />
        <select value={form.bedrooms} onChange={set('bedrooms')}>
          <option value="">Any bedrooms</option>
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ bedrooms</option>)}
        </select>
        <select value={form.sort} onChange={set('sort')}>
          <option value="">Newest first</option>
          <option value="priceAsc">Price: low to high</option>
          <option value="priceDesc">Price: high to low</option>
          <option value="oldest">Oldest first</option>
        </select>
        <button className="btn" type="submit">Apply</button>
        <button className="btn btn-outline" type="button" onClick={reset}>Reset</button>
      </form>

      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : data.items.length === 0 ? (
        <p className="muted">No properties match your search.</p>
      ) : (
        <>
          <p className="muted">{data.total} properties found</p>
          <div className="grid">{data.items.map((p) => <PropertyCard key={p._id} property={p} />)}</div>
          {data.pages > 1 && (
            <div className="pager">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => goPage(page - 1)}>Previous</button>
              <span>Page {data.page} of {data.pages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= data.pages} onClick={() => goPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </>
  );
}
