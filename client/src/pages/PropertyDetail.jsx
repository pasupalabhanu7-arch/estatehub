import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg, FALLBACK_IMG, formatPrice } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, favIds, toggleFavorite } = useAuth();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setError('');
    api.get(`/properties/${id}`)
      .then(({ data }) => { setProperty(data); setActiveImg(0); })
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error) return <p className="alert error">{error}</p>;
  if (!property) return <p className="muted">Loading...</p>;

  const isOwner = user && property.owner && user._id === property.owner._id;
  const canManage = user && (isOwner || user.role === 'admin');
  const isFav = favIds.includes(property._id);
  const images = property.images?.length ? property.images : [FALLBACK_IMG];
  const onImgError = (e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; };

  const sendInquiry = async (e) => {
    e.preventDefault();
    setNotice('');
    try {
      await api.post('/inquiries', { property: property._id, message });
      setMessage('');
      setNotice('Your message was sent to the owner.');
    } catch (err) {
      setNotice(errMsg(err));
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await api.delete(`/properties/${property._id}`);
      navigate('/dashboard');
    } catch (err) {
      setNotice(errMsg(err));
    }
  };

  const setStatus = async (status) => {
    try {
      const { data } = await api.put(`/properties/${property._id}`, { status });
      setProperty({ ...property, status: data.status });
    } catch (err) {
      setNotice(errMsg(err));
    }
  };

  return (
    <div className="detail">
      <div className="detail-gallery">
        <img className="detail-main" src={images[activeImg]} alt={property.title} onError={onImgError} />
        {images.length > 1 && (
          <div className="thumbs">
            {images.map((src, i) => (
              <img key={i} src={src} alt="" className={i === activeImg ? 'active' : ''} onClick={() => setActiveImg(i)} onError={onImgError} />
            ))}
          </div>
        )}
      </div>

      <div className="detail-info">
        <div className="row-between">
          <span className={`badge badge-${property.listingType} static`}>For {property.listingType}</span>
          <span className={`badge badge-status-${property.status} static`}>{property.status.toUpperCase()}</span>
        </div>
        <h1>{property.title}</h1>
        <div className="price big">{formatPrice(property.price, property.listingType)}</div>
        <p className="muted">
          📍 {[property.location?.address, property.location?.city, property.location?.state].filter(Boolean).join(', ')}
        </p>

        <div className="facts">
          <div><strong>{property.bedrooms}</strong><span>Bedrooms</span></div>
          <div><strong>{property.bathrooms}</strong><span>Bathrooms</span></div>
          <div><strong>{property.area}</strong><span>Sq ft</span></div>
          <div><strong className="cap">{property.propertyType}</strong><span>Type</span></div>
        </div>

        <h3>Description</h3>
        <p>{property.description}</p>

        <div className="actions">
          <button
            className="btn btn-outline"
            onClick={() => (user ? toggleFavorite(property._id) : navigate('/login'))}
          >
            {isFav ? '♥ Saved' : '♡ Save'}
          </button>
          {canManage && (
            <>
              <Link className="btn btn-outline" to={`/dashboard/edit/${property._id}`}>Edit</Link>
              {property.status === 'available' ? (
                <button className="btn btn-outline" onClick={() => setStatus(property.listingType === 'sale' ? 'sold' : 'rented')}>
                  Mark as {property.listingType === 'sale' ? 'sold' : 'rented'}
                </button>
              ) : (
                <button className="btn btn-outline" onClick={() => setStatus('available')}>Mark available</button>
              )}
              <button className="btn btn-danger" onClick={remove}>Delete</button>
            </>
          )}
        </div>

        <div className="box">
          <h3>Owner</h3>
          <p><strong>{property.owner?.name}</strong></p>
          {property.owner?.phone && <p className="muted">📞 {property.owner.phone}</p>}
          {property.owner?.email && <p className="muted">✉ {property.owner.email}</p>}
        </div>

        {!isOwner && (
          <form className="box" onSubmit={sendInquiry}>
            <h3>Contact owner</h3>
            {!user ? (
              <p className="muted"><Link to="/login">Log in</Link> to send a message to the owner.</p>
            ) : (
              <>
                <textarea rows="3" required placeholder="I am interested in this property..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <button className="btn" type="submit">Send message</button>
              </>
            )}
          </form>
        )}
        {notice && <p className="alert info">{notice}</p>}
      </div>
    </div>
  );
}
