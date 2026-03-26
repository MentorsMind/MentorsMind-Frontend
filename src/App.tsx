import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar';
import { ProtectedRoute } from './components/navigation/ProtectedRoute';
import { ROUTES } from './config/routes.config';
import Home from './pages/Home';
import Settings from './pages/Settings';
import type { AuthState, User } from './types';

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user') ?? sessionStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<User> & { email?: string; name?: string; role?: string; id?: string };
    if (!parsed.email || !parsed.name || !parsed.role) return null;
    return {
      id: parsed.id ?? `user-${Date.now()}`,
      email: parsed.email,
      name: parsed.name,
      role: (parsed.role as User['role']) ?? 'learner',
      avatar: parsed.avatar,
      bio: parsed.bio,
    };
  } catch {
    return null;
  }
}

export default function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const user = readStoredUser();
    return {
      user: user ?? { id: 'demo', name: 'Demo User', email: 'demo@mentorsmind.dev', role: 'learner' },
      isAuthenticated: true,
      isLoading: false,
    };
  });

  const onLogout = async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('user');
    setAuth({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar auth={auth} onLogout={onLogout} />

        <main className="min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route
              path={ROUTES.SETTINGS}
              element={
                <ProtectedRoute auth={auth}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
