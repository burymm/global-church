import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { UserLocation } from '../types'

interface LocationState {
  userLocations: UserLocation[]
  isSharing: boolean
  watchId: number | null
  fetchOnlineLocations: () => Promise<void>
  startSharing: () => void
  stopSharing: () => void
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLocations: [],
  isSharing: false,
  watchId: null,

  fetchOnlineLocations: async () => {
    const { data } = await supabase
      .from('users')
      .select('id, location_lat, location_lng, is_sharing_location, updated_at')
      .eq('is_sharing_location', true)
      .not('location_lat', 'is', null)

    const locations: UserLocation[] = (data || []).map((u: any) => ({
      id: u.id, user_id: u.id, lat: u.location_lat, lng: u.location_lng,
      accuracy: null, updated_at: u.updated_at, is_sharing: true,
    }))
    set({ userLocations: locations })
  },

  startSharing: () => {
    if (!navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        await supabase.from('user_locations').upsert({
          user_id: session.user.id, lat, lng,
          accuracy: pos.coords.accuracy, is_sharing: true,
        })
        await supabase.from('users').update({
          location_lat: lat, location_lng: lng,
          location_updated_at: new Date().toISOString(),
          is_sharing_location: true,
        }).eq('id', session.user.id)
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    )
    set({ isSharing: true, watchId })
  },

  stopSharing: async () => {
    const { watchId } = get()
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('users').update({ is_sharing_location: false })
        .eq('id', session.user.id)
    }
    set({ isSharing: false, watchId: null })
  },
}))
