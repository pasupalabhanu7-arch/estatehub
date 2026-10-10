import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FALLBACK_IMG, formatPrice } from '../api.js';

export default function PropertyCard({ property }) {
  const { user, favIds, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const isFav = favIds.includes(property._id);

  const onHeart = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await toggleFavorite(property._id);
    } catch (err) {
      /* ignore, UI stays as is */
    }
  };

  return (
    <Link to={`/properties/${property._id}`} className="card">
      <div className="card-img">
        <img
          src={property.images?.[0] || FALLBACK_IMG}
          alt={property.title}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
        />
        <span className={`badge badge-${property.listingType}`}>For {property.listingType}</span>
        {property.status !== 'available' && <span className="badge badge-status">{property.status.toUpperCase()}</span>}
        <button className="heart" onClick={onHeart} title="Save to favorites" aria-label="Save to favorites">
          {isFav ? '♥' : '♡'}
        </button>
      </div>
      <div className="card-body">
        <div className="price">{formatPrice(property.price, property.listingType)}</div>
        <h3>{property.title}</h3>
        <p className="muted">📍 {property.location?.city}{property.location?.state ? `, ${property.location.state}` : ''}</p>
        <p className="meta">
          {property.bedrooms > 0 && <span>🛏 {property.bedrooms} bd</span>}
          {property.bathrooms > 0 && <span>🛁 {property.bathrooms} ba</span>}
          {property.area > 0 && <span>📐 {property.area} sqft</span>}
          <span className="cap">{property.propertyType}</span>
        </p>
      </div>
    </Link>
  );
}
