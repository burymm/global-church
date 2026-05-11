import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import i18n from '../i18n';
import type { User } from '../types';

interface AuthState {
  session: any | null;
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
            const supabaseUrl = (supabase as any).supabaseUrl;
            const supabaseKey = (supabase as any).supabaseKey;

            const url = `${supabaseUrl}/rest/v1/users?id=eq.${session.user.id}&select=*`;
            const resp = await fetch(url, {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
            });
            const body = await resp.json();
            const user = body?.[0] as User | undefined;
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
    if (!get().session) return;
    await supabase.from('users').update(updates).eq('id', get().session.user.id);
    set({ user: get().user ? ({ ...get().user, ...updates } as User) : null });
  },
}));
