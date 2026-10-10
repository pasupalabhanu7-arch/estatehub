import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import PropertyCard from '../components/PropertyCard.jsx';

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [listingType, setListingType] = useState('');
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    api.get('/properties', { params: { limit: 6, status: 'available' } })
      .then(({ data }) => setLatest(data.items))
      .catch(() => setLatest([]));
  }, []);

  const search = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (listingType) params.set('listingType', listingType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <h1>Find your next home</h1>
        <p>Search properties for sale or rent across India.</p>
        <form className="hero-search" onSubmit={search}>
          <input placeholder="City, area or keyword" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={listingType} onChange={(e) => setListingType(e.target.value)}>
            <option value="">Buy or Rent</option>
            <option value="sale">Buy</option>
            <option value="rent">Rent</option>
          </select>
          <button className="btn" type="submit">Search</button>
        </form>
      </section>

      <h2 className="section-title">Latest listings</h2>
      {latest.length === 0 ? (
        <p className="muted">No properties yet. Run the seed script or add a listing.</p>
      ) : (
        <div className="grid">{latest.map((p) => <PropertyCard key={p._id} property={p} />)}</div>
      )}
    </>
  );
}
