import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileMenu.css';

function ProfileMenu({ user }) {
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const { signOut } = useAuth();

  useEffect(() => {
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && menuRef.current?.contains(document.activeElement)) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function handleSignOut() {
    setOpen(false);
    signOut();
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Menu do perfil de ${user?.displayName || 'usuário'}`}
        className="profile-menu__trigger"
        onClick={() => setOpen((open) => !open)}
        ref={triggerRef}
        type="button"
      >
        <img alt="" className="profile-menu__avatar" src="/profile-avatar.svg" />
        <span className="profile-menu__name">{user?.displayName}</span>
        <ChevronDown aria-hidden="true" className="profile-menu__chevron" size={16} />
      </button>

      {isOpen && (
        <div className="profile-menu__dropdown" role="menu">
          <div className="profile-menu__identity">
            <strong>{user?.displayName}</strong>
            <span>{user?.identifier}</span>
          </div>
          <Link
            className="profile-menu__item"
            onClick={() => setOpen(false)}
            role="menuitem"
            to="/profile"
          >
            <UserRound aria-hidden="true" size={17} />
            Meu perfil
          </Link>
          <button className="profile-menu__item" disabled role="menuitem" type="button">
            <Settings aria-hidden="true" size={17} />
            Configurações
            <span className="profile-menu__soon">Em breve</span>
          </button>
          <div className="profile-menu__divider" />
          <button
            className="profile-menu__item profile-menu__item--logout"
            onClick={handleSignOut}
            role="menuitem"
            type="button"
          >
            <LogOut aria-hidden="true" size={17} />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
