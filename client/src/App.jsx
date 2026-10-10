import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Listings from './pages/Listings.jsx';
import PropertyDetail from './pages/PropertyDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PropertyForm from './pages/PropertyForm.jsx';
import Favorites from './pages/Favorites.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Listings />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute roles={['owner', 'admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/new" element={<ProtectedRoute roles={['owner', 'admin']}><PropertyForm /></ProtectedRoute>} />
          <Route path="/dashboard/edit/:id" element={<ProtectedRoute roles={['owner', 'admin']}><PropertyForm /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">EstateHub - MERN Real Estate Listing Platform</footer>
    </>
  );
}
