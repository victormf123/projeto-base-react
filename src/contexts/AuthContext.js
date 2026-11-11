import { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'projeto-base.auth-user';
const AuthContext = createContext(null);

function readStoredUser() {
  const storedValue =
    window.localStorage.getItem(STORAGE_KEY) ||
    window.sessionStorage.getItem(STORAGE_KEY);

  if (!storedValue) return null;

  try {
    const user = JSON.parse(storedValue);
    if (
      user &&
      typeof user.identifier === 'string' &&
      typeof user.displayName === 'string'
    ) {
      return user;
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  return null;
}

function createDisplayName(identifier) {
  const name = identifier.split('@')[0].replace(/[._-]+/g, ' ').trim();
  return name.replace(/\b\w/g, (letter) => letter.toLocaleUpperCase()) || 'Usuário';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  function signIn({ identifier, rememberMe }) {
    const nextUser = {
      identifier,
      displayName: createDisplayName(identifier),
    };
    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    const otherStorage = rememberMe ? window.sessionStorage : window.localStorage;

    otherStorage.removeItem(STORAGE_KEY);
    storage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function signOut() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return context;
}
