import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

export function AuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(t('callback.authorizing'));

  useEffect(() => {
    let handled = false;

    const upsertUser = async (session: any) => {
      if (handled) return;
      handled = true;

      const userId = session.user.id;
      const displayName = session.user.user_metadata?.full_name || session.user.email || 'User';
      const avatarUrl = session.user.user_metadata?.avatar_url || null;

      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          display_name: displayName,
          avatar_url: avatarUrl,
        }, { onConflict: 'id' });

      if (upsertError) {
        setStatus(t('callback.profileError'));
        setTimeout(() => navigate('/auth', { replace: true }), 3000);
        return;
      }

      navigate('/', { replace: true });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        await upsertUser(session);
      }
    });

    const timeout = setTimeout(async () => {
      if (handled) return;
      subscription.unsubscribe();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await upsertUser(session);
      } else {
        setStatus(t('callback.timeout'));
        setTimeout(() => navigate('/auth', { replace: true }), 3000);
      }
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, t]);

  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <p className="text-gray-500">{status}</p>
    </div>
  );
}
