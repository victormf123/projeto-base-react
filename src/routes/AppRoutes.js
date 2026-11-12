import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout/MainLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import Home from '../pages/Home/Home';
import ProfilePage from '../pages/ProfilePage';
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

function RegisterRoute() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  function handleRegistrationSuccess(email) {
    signIn({ identifier: email, rememberMe: false });
    navigate('/', { replace: true });
  }

  return <RegisterPage onRegistrationSuccess={handleRegistrationSuccess} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<RegisterRoute />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro-itens" element={<CadastroItens />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
