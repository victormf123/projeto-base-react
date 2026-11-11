import { Boxes, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isOpen, onNavigate }) {
  return (
    <aside
      aria-label="Navegação principal"
      className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
      id="main-sidebar"
    >
      <div className="sidebar__section-label">MENU</div>
      <nav className="sidebar__nav">
        <NavLink
          className={({ isActive }) =>
            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
          }
          onClick={onNavigate}
          to="/cadastro-itens"
        >
          <Boxes aria-hidden="true" size={19} strokeWidth={1.8} />
          <span>Cadastro de Itens</span>
        </NavLink>
      </nav>
      <div className="sidebar__footer">
        <LayoutDashboard aria-hidden="true" size={15} />
        <span>Área de trabalho</span>
      </div>
    </aside>
  );
}

export default Sidebar;
