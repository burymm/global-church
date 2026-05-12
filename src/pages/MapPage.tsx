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

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const CLUSTER_RADIUS = 30;

function groupLocations(locations: any[]): any[] {
  const assigned = new Set<string>();
  const groups: any[][] = [];

  for (const a of locations) {
    if (assigned.has(a.user_id)) continue;

    const cluster: any[] = [a];
    assigned.add(a.user_id);

    for (const b of locations) {
      if (assigned.has(b.user_id)) continue;
      if (haversineDistance(a.lat, a.lng, b.lat, b.lng) <= CLUSTER_RADIUS) {
        cluster.push(b);
        assigned.add(b.user_id);
      }
    }

    groups.push(cluster);
  }

  return groups.map((g) => (g.length > 1 ? g : g[0]));
}

function userIcon(emoji: string, isMe: boolean) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${isMe ? '#10b981' : '#3b82f6'};width:28px;height:28px;border-radius:50%;border:3px solid ${isMe ? '#059669' : 'white'};box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;color:white;">${emoji}</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  })
}

const ZOOM_ME = 18;

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

    const btn = L.DomUtil.create('button')
    btn.innerHTML = isSharing ? i18n.t('map.stopSharing') : i18n.t('map.shareLocation');
    btn.style.cssText = 'padding:8px 12px;background:white;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);cursor:pointer;border:none;font-size:12px;margin-bottom:4px;'
    btn.addEventListener('click', handleLocate);

    const centerBtn = L.DomUtil.create('button')
    centerBtn.innerHTML = '📍'
    centerBtn.title = i18n.t('map.centerOnMe')
    centerBtn.style.cssText = 'padding:8px 12px;background:white;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);cursor:pointer;border:none;font-size:14px;'
    centerBtn.addEventListener('click', () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], ZOOM_ME),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 },
      );
    });

    const container = L.DomUtil.create('div')
    container.appendChild(btn)
    container.appendChild(centerBtn)

    const Ctrl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: () => container,
    })
    const ctrl = new Ctrl()
    map.addControl(ctrl)

    btnRef.current = btn;
    i18n.on('languageChanged', updateText)
    return () => { map.removeControl(ctrl); btnRef.current = null; }
  }, [map, isSharing, handleLocate])
  return null
}

function CenterOnMe() {
  const map = useMap()
  const { isSharing } = useLocationStore()

  useEffect(() => {
    if (!isSharing) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], ZOOM_ME),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, [isSharing]);

  return null
}

function MapClickHandler() {
  const { setActiveUser } = useChatStore()
  useMapEvents({ click: () => setActiveUser(null) })
  return null
}

function churchIcon(count: number) {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;background:#f59e0b;width:36px;height:36px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;color:white">⛪<span style="position:absolute;bottom:-4px;right:-6px;background:#ef4444;color:white;font-size:10px;font-weight:bold;min-width:16px;height:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid white">${count}</span></div>`,
    iconSize: [36, 36], iconAnchor: [18, 18],
  })
}

function GroupPopupContent({ members, onChat }: { members: any[]; onChat: (userId: string) => void }) {
  return (
    <div className="min-w-[160px]">
      {members.map((m: any) => (
        <button key={m.user_id} onClick={() => onChat(m.user_id)}
          className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded text-left">
          <span className="text-lg">{m.display_icon || '✝'}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{m.display_name}</p>
            {m.statuses?.length > 0 && (
              <p className="text-xs text-blue-600 truncate">
                {m.statuses.map((s: string) => `${statusIcons[s] || ''} ${i18n.t(`profile.statusesList.${s}`)}`).join(' · ')}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  )
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
  const grouped = groupLocations(userLocations)

  return (
    <div className="relative h-full pb-16">
      <MapContainer center={defaultCenter} zoom={12} zoomControl={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer attribution="" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        <LocateControl />
        <CenterOnMe />
        <MapClickHandler />
        {grouped.map((item) => {
          if (Array.isArray(item)) {
            const lat = item.reduce((s, u) => s + u.lat, 0) / item.length;
            const lng = item.reduce((s, u) => s + u.lng, 0) / item.length;
            return (
              <Marker
                key={`g-${item.map((u) => u.user_id).sort().join('-')}`}
                position={[lat, lng]}
                icon={churchIcon(item.length)}
              >
                <Popup>
                  <GroupPopupContent members={item} onChat={setActiveUser} />
                </Popup>
              </Marker>
            );
          }
          return (
            <Marker
              key={item.user_id}
              ref={(el) => handleMarkerRef(item.user_id, el as any)}
              position={[item.lat, item.lng]}
              icon={userIcon(item.display_icon || '✝', item.user_id === myId)}
              eventHandlers={{ click: () => setActiveUser(item.user_id) }}
            >
              <Popup>
                <PopupContent loc={item} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  )
}
