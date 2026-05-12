import { useEffect, useCallback, useRef } from 'react'
import i18n, { statusIcons } from '../i18n'
import { useLocationStore } from '../store/locationStore'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const defaultCenter: [number, number] = [53.9, 27.56]

function userIcon(emoji: string, isMe: boolean) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${isMe ? '#10b981' : '#3b82f6'};width:28px;height:28px;border-radius:50%;border:3px solid ${isMe ? '#059669' : 'white'};box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;color:white;">${emoji}</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  })
}

function LocateControl() {
  const map = useMap()
  const { isSharing, startSharing, stopSharing } = useLocationStore()
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const handleLocate = useCallback(async () => {
    if (isSharing) {
      stopSharing();
    } else {
      await startSharing();
    }
  }, [isSharing, startSharing, stopSharing])

  useEffect(() => {
    const updateText = () => {
      if (btnRef.current) {
        btnRef.current.innerHTML = isSharing ? i18n.t('map.stopSharing') : i18n.t('map.shareLocation');
      }
    };

    const Ctrl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: () => {
        const btn = L.DomUtil.create('button')
        btn.innerHTML = isSharing ? i18n.t('map.stopSharing') : i18n.t('map.shareLocation');
        btn.style.cssText = 'padding:8px 12px;background:white;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);cursor:pointer;border:none;font-size:12px;'
        btn.addEventListener('click', handleLocate);
        btnRef.current = btn;
        return btn;
      },
    })
    const ctrl = new Ctrl()
    map.addControl(ctrl)

    i18n.on('languageChanged', updateText)
    return () => { map.removeControl(ctrl); btnRef.current = null; }
  }, [map, isSharing, handleLocate])
  return null
}

function MapClickHandler() {
  const { setActiveUser } = useChatStore()
  useMapEvents({ click: () => setActiveUser(null) })
  return null
}

function PopupContent({ loc }: { loc: any }) {
  return (
    <div className="text-center min-w-[140px]">
      {loc.avatar_url && (
        <img src={loc.avatar_url} alt="" className="w-10 h-10 rounded-full mx-auto mb-1" />
      )}
      <p className="font-medium text-sm">{loc.display_name}</p>
      {loc.denomination && (
        <p className="text-xs text-gray-500">{i18n.t(`profile.denominations.${loc.denomination}`)}</p>
      )}
      {loc.statuses?.length > 0 && (
        <p className="text-xs text-blue-600 mt-0.5">
          {loc.statuses.map((s: string) => `${statusIcons[s] || ''} ${i18n.t(`profile.statusesList.${s}`)}`).join(' · ')}
        </p>
      )}
    </div>
  )
}

export function MapPage() {
  const { userLocations, fetchOnlineLocations, startHeartbeat, stopHeartbeat, startSharing } = useLocationStore()
  const { activeUserId, setActiveUser } = useChatStore()
  const { user: currentUser } = useAuthStore()
  const markerRefs = useRef<Map<string, L.Marker>>(new Map())
  const prevActive = useRef<string | null>(null)

  useEffect(() => {
    fetchOnlineLocations()
    const interval = setInterval(fetchOnlineLocations, 30000)
    return () => clearInterval(interval)
  }, [fetchOnlineLocations])

  useEffect(() => {
    startHeartbeat()
    return () => stopHeartbeat()
  }, [])

  useEffect(() => {
    if (currentUser?.is_sharing_location) startSharing()
  }, [])

  useEffect(() => {
    const prev = prevActive.current
    const curr = activeUserId

    if (prev && prev !== curr) {
      markerRefs.current.get(prev)?.closePopup()
    }

    if (curr) {
      markerRefs.current.get(curr)?.openPopup()
    }

    prevActive.current = curr
  }, [activeUserId])

  const handleMarkerRef = useCallback((userId: string, el: L.Marker | null) => {
    if (el) markerRefs.current.set(userId, el)
    else markerRefs.current.delete(userId)
  }, [])

  const myId = currentUser?.id

  return (
    <div className="relative h-full pb-16">
      <MapContainer center={defaultCenter} zoom={12} zoomControl={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer attribution="" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        <LocateControl />
        <MapClickHandler />
        {userLocations.map((loc) => (
          <Marker
            key={loc.user_id}
            ref={(el) => handleMarkerRef(loc.user_id, el as any)}
            position={[loc.lat, loc.lng]}
            icon={userIcon(loc.display_icon || '✝', loc.user_id === myId)}
            eventHandlers={{ click: () => setActiveUser(loc.user_id) }}
          >
            <Popup>
              <PopupContent loc={loc} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
