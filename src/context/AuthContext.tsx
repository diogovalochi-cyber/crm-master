import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, RolePermissions } from '../types/auth';
import { ROLE_PERMISSIONS } from '../types/auth';
import { supabase } from '../lib/supabase';

export interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: RolePermissions | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  hasPermission: (key: keyof RolePermissions) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<User | null> {
  const { data } = await supabase
    .from('users_profile')
    .select('*')
    .eq('id', userId)
    .single();
  return data as User | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setCurrentUser(profile);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const permissions: RolePermissions | null = currentUser
    ? ROLE_PERMISSIONS[currentUser.role]
    : null;

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: 'Credenciais inválidas. Verifique e-mail e senha.' };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const hasPermission = useCallback((key: keyof RolePermissions): boolean => {
    if (!permissions) return false;
    return permissions[key];
  }, [permissions]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: currentUser !== null,
      isLoading,
      permissions,
      login,
      logout,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
