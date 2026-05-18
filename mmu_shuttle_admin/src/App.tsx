import { Routes, Route, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { RoutesPage } from './pages/RoutesPage';
import { DriversPage } from './pages/DriversPage';
import { EditRouteMapPage } from './pages/EditRouteMapPage';
import { LoginPage } from './pages/LoginPage';
import { useMockData } from './contexts/MockDataContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useMockData();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/routes" replace />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/drivers" element={<DriversPage />} />
      </Route>
      <Route path="/routes/:id/edit" element={<ProtectedRoute><EditRouteMapPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
