import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import './MainLayout.css';

function MainLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  function toggleSidebar() {
    setSidebarOpen((open) => !open);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className={`main-layout${isSidebarOpen ? ' main-layout--sidebar-open' : ''}`}>
      <Topbar isSidebarOpen={isSidebarOpen} onMenuToggle={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onNavigate={closeSidebar} />
      {isSidebarOpen && (
        <button
          aria-label="Fechar menu lateral"
          className="main-layout__backdrop"
          onClick={closeSidebar}
          type="button"
        />
      )}
      <main className="main-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
