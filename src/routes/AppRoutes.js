import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout/MainLayout';
import LoginPage from '../pages/LoginPage';
import Home from '../pages/Home/Home';
import CadastroItens from '../pages/CadastroItens/CadastroItens';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

function LoginRoute() {
  const { user, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const destination = location.state?.from?.pathname || '/';

  if (user) {
    return <Navigate to={destination} replace />;
  }

  function handleLoginSuccess(details) {
    signIn(details);
    navigate(destination, { replace: true });
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro-itens" element={<CadastroItens />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
