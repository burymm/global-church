import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { UserLocation } from '../types';

interface LocationState {
  userLocations: UserLocation[];
  isSharing: boolean;
  watchId: number | null;
  isOnlineInterval: ReturnType<typeof setInterval> | null;
  _isUpdating: boolean;
  fetchOnlineLocations: () => Promise<void>;
  startSharing: () => void;
  stopSharing: () => void;
  startHeartbeat: () => void;
  stopHeartbeat: () => void;
  _handleHeartbeat: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLocations: [],
  isSharing: false,
  watchId: null,
  isOnlineInterval: null,
  _isUpdating: false,

  fetchOnlineLocations: async () => {
    const { data: me } = await supabase
      .from('users')
      .select('blocked_user_ids')
      .eq('id', (await supabase.auth.getSession()).data.session?.user.id)
      .maybeSingle();

    const blocked = (me?.blocked_user_ids as string[]) || [];
    const myId = (await supabase.auth.getSession()).data.session?.user.id;

    const { data } = await supabase
      .from('users')
      .select('id, display_name, display_icon, avatar_url, denomination, statuses, location_lat, location_lng, is_sharing_location, updated_at, is_online')
      .eq('is_sharing_location', true)
      .not('location_lat', 'is', null);

    const locations: UserLocation[] = (data || [])
      .filter((u: any) => !blocked.includes(u.id))
      .map((u: any) => ({
        id: u.id, user_id: u.id, lat: u.location_lat, lng: u.location_lng,
        accuracy: null, updated_at: u.updated_at, is_sharing: true,
        display_name: u.display_name, display_icon: u.display_icon, avatar_url: u.avatar_url,
        denomination: u.denomination, statuses: u.statuses || [],
        is_online: u.is_online,
      }));
    set({ userLocations: locations });

    const isSharingInDB = data?.some((u: any) => u.id === myId) || false;
    const { isSharing, watchId } = get();
    if (isSharingInDB !== isSharing) {
      if (!isSharingInDB && watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      set({ isSharing: isSharingInDB, watchId: isSharingInDB ? watchId : null });
    }
  },

  startHeartbeat: () => {
    const { isOnlineInterval } = get();
    if (isOnlineInterval) return;
    get()._handleHeartbeat();
    const interval = setInterval(get()._handleHeartbeat, 60000);
    set({ isOnlineInterval: interval });
  },

  stopHeartbeat: async () => {
    const { isOnlineInterval } = get();
    if (isOnlineInterval) clearInterval(isOnlineInterval);
    set({ isOnlineInterval: null });
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('users').update({
        is_online: false,
        last_seen_at: new Date().toISOString(),
      }).eq('id', session.user.id);
    }
  },

  _handleHeartbeat: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('users').update({
      is_online: true,
      last_seen_at: new Date().toISOString(),
    }).eq('id', session.user.id);
  },

  startSharing: () => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        if (get()._isUpdating) return;
        set({ _isUpdating: true });
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;
          await supabase.from('users').update({
            location_lat: lat, location_lng: lng,
            location_updated_at: new Date().toISOString(),
            is_sharing_location: true, is_online: true,
          }).eq('id', session.user.id);
          get().fetchOnlineLocations();
        } finally {
          set({ _isUpdating: false });
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );
    set({ isSharing: true, watchId });
  },

  stopSharing: async () => {
    const { watchId } = get();
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('users').update({ is_sharing_location: false })
        .eq('id', session.user.id);
    }
    set({ isSharing: false, watchId: null });
    get().fetchOnlineLocations();
  },
}));
