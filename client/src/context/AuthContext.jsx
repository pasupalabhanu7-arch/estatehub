import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favIds, setFavIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const { data } = await api.get('/properties/favorites');
      setFavIds(data.items.map((p) => p._id));
    } catch (e) {
      setFavIds([]);
    }
  }, []);

  // Restore session on page load
  useEffect(() => {
    const init = async () => {
      let token = null;
      try { token = localStorage.getItem('token'); } catch (e) { /* ignore */ }
      if (!token) return setLoading(false);
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        await loadFavorites();
      } catch (e) {
        try { localStorage.removeItem('token'); } catch (e2) { /* ignore */ }
      }
      setLoading(false);
    };
    init();
  }, [loadFavorites]);

  const saveSession = async (data) => {
    try { localStorage.setItem('token', data.token); } catch (e) { /* ignore */ }
    setUser(data.user);
    await loadFavorites();
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await saveSession(data);
    return data.user;
  };

  const register = async (form) => {
    const { data } = await api.post('/auth/register', form);
    await saveSession(data);
    return data.user;
  };

  const logout = () => {
    try { localStorage.removeItem('token'); } catch (e) { /* ignore */ }
    setUser(null);
    setFavIds([]);
  };

  const toggleFavorite = async (propertyId) => {
    const { data } = await api.post(`/properties/${propertyId}/favorite`);
    setFavIds(data.favorites.map(String));
    return data.favorited;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, favIds, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
}
