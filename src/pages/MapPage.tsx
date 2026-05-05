import { useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocationStore } from '../store/locationStore'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useChatStore } from '../store/chatStore'

// Fix Leaflet default icon
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const defaultCenter: [number, number] = [53.9, 27.56]

function userIcon() {
  return L.divIcon({
    className: '',
    html: '<div style="background:#3b82f6;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">✝</div>',
    iconSize: [28, 28], iconAnchor: [14, 14],
  })
}

function LocateControl() {
  const map = useMap()
  const { isSharing, startSharing, stopSharing } = useLocationStore()
  const handleLocate = useCallback(() => { isSharing ? stopSharing() : startSharing() }, [isSharing, startSharing, stopSharing])
  useEffect(() => {
    const Ctrl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: () => {
        const btn = L.DomUtil.create('button')
        btn.innerHTML = isSharing ? '🔴 Остановить' : '📍 Поделиться'
        btn.style.cssText = 'padding:8px 12px;background:white;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);cursor:pointer;border:none;font-size:12px;'
        btn.addEventListener('click', handleLocate)
        return btn
      },
    })
    const ctrl = new Ctrl()
    map.addControl(ctrl)
    return () => {
      map.removeControl(ctrl)
    }
  }, [map, isSharing, handleLocate])
  return null
}

export function MapPage() {
  const { t } = useTranslation()
  const { userLocations, fetchOnlineLocations } = useLocationStore()
  const { setActiveUser } = useChatStore()
  useEffect(() => {
    fetchOnlineLocations()
    const interval = setInterval(fetchOnlineLocations, 30000)
    return () => clearInterval(interval)
  }, [fetchOnlineLocations])
  return (
    <div className="relative h-full">
      <MapContainer center={defaultCenter} zoom={12} zoomControl={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer attribution="" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        <LocateControl />
        {userLocations.map((loc) => (
          <Marker key={loc.user_id} position={[loc.lat, loc.lng]} icon={userIcon()} eventHandlers={{ click: () => setActiveUser(loc.user_id) }}>
            <Popup><div className="text-center"><p className="font-medium">Пользователь</p><p className="text-xs text-gray-500">{t('map.readyTo')}: {loc.updated_at}</p></div></Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
