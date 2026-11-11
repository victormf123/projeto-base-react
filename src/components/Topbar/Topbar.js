import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import ProfileMenu from '../ProfileMenu/ProfileMenu';
import { useAuth } from '../../contexts/AuthContext';
import './Topbar.css';

function Topbar({ isSidebarOpen, onMenuToggle }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          aria-controls="main-sidebar"
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
          className="topbar__menu-button"
          onClick={onMenuToggle}
          type="button"
        >
          <Menu aria-hidden="true" size={21} />
        </button>
        <Link className="topbar__brand" to="/">
          <span aria-hidden="true" className="topbar__brand-mark">A</span>
          <span>Acesso</span>
        </Link>
      </div>
      <ProfileMenu user={user} />
    </header>
  );
}

export default Topbar;
