import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PropertyCard from '../components/PropertyCard.jsx';

export default function Favorites() {
  const { favIds } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Re-fetch when favIds changes so un-saving removes the card
  useEffect(() => {
    api.get('/properties/favorites')
      .then(({ data }) => setItems(data.items))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [favIds]);

  return (
    <>
      <h2 className="section-title">Saved properties</h2>
      {error && <p className="alert error">{error}</p>}
      {loading ? <p className="muted">Loading...</p> : items.length === 0 ? (
        <p className="muted">You have not saved any properties yet.</p>
      ) : (
        <div className="grid">{items.map((p) => <PropertyCard key={p._id} property={p} />)}</div>
      )}
    </>
  );
}
