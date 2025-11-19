import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardUser from './pages/DashboardUser';
import DashboardAgent from './pages/DashboardAgent';
import DashboardAdmin from './pages/DashboardAdmin';
import ItemCreate from './pages/ItemCreate';
import ItemList from './pages/ItemList';
import PickupStatus from './pages/PickupStatus';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard/user"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <DashboardUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/agent"
                element={
                  <ProtectedRoute allowedRoles={['agent']}>
                    <DashboardAgent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/items/create"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <ItemCreate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/items"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <ItemList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pickup/:id"
                element={
                  <ProtectedRoute>
                    <PickupStatus />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


