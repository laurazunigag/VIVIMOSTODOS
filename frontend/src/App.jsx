import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/ContextoAutenticacion';
import PaginaLogin from './pages/PaginaLogin';
import PaginaDashboard from './pages/PaginaDashboard';
import PaginaUsuarios from './pages/PaginaUsuarios';
import PaginaInventario from './pages/PaginaInventario';
import PaginaReservas from './pages/PaginaReservas';
import LayoutPrincipal from './components/LayoutPrincipal';

function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, cargando, esAdmin } = useAuth();

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  if (soloAdmin && !esAdmin) return <Navigate to="/dashboard" replace />;

  return <LayoutPrincipal>{children}</LayoutPrincipal>;
}

export default function App() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/dashboard" replace /> : <PaginaLogin />} />
      <Route path="/dashboard" element={<RutaProtegida><PaginaDashboard /></RutaProtegida>} />
      <Route path="/usuarios" element={<RutaProtegida soloAdmin><PaginaUsuarios /></RutaProtegida>} />
      <Route path="/inventario" element={<RutaProtegida><PaginaInventario /></RutaProtegida>} />
      <Route path="/reservas" element={<RutaProtegida><PaginaReservas /></RutaProtegida>} />
      <Route path="/" element={<Navigate to={usuario ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}