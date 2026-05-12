import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import i18n from '../i18n';
import type { User } from '../types';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  init: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,

  init: () => {
    const channel = supabase.auth.onAuthStateChange((event, session) => {
      const handle = async () => {
        if (event === 'SIGNED_OUT') {
          set({ session: null, user: null, isLoading: false });
          return;
        }

        if (session) {
          try {
            const { data: users, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (error) throw error;
            const user = users as User | undefined;
            if (user?.language) i18n.changeLanguage(user.language);
            set({ session, user, isLoading: false });
          } catch {
            set({ session: null, user: null, isLoading: false });
          }
        } else {
          set({ session: null, isLoading: false });
        }
      };

      handle();
    });

    return () => channel.data.subscription.unsubscribe();
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  updateUser: async (updates: Partial<User>) => {
    const session = get().session;
    if (!session) return;
    await supabase.from('users').update(updates).eq('id', session.user.id);
    const currentUser = get().user;
    set({ user: currentUser ? { ...currentUser, ...updates } : null });
  },
}));
