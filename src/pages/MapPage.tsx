import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n, { statusIcons } from '../i18n';
import { useLocationStore } from '../store/locationStore';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { UserLocation } from '../types';

L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultCenter: [number, number] = [53.9, 27.56];

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

function groupLocations(locations: UserLocation[]): (UserLocation | UserLocation[])[] {
  const assigned = new Set<string>();
  const groups: UserLocation[][] = [];

  for (const a of locations) {
    if (assigned.has(a.user_id)) continue;

    const cluster: UserLocation[] = [a];
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
  });
}

const ZOOM_ME = 18;

function LocateControl() {
  const map = useMap();
  const { isSharing, startSharing, stopSharing } = useLocationStore();

  const handleLocate = useCallback(async () => {
    if (isSharing) {
      stopSharing();
    } else {
      await startSharing();
    }
  }, [isSharing, startSharing, stopSharing]);

  const handleCenter = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], ZOOM_ME),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, [map]);

  useEffect(() => {
    const container = L.DomUtil.create('div');
    container.className = 'flex flex-row gap-1';

    const Ctrl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: () => container,
    });
    const ctrl = new Ctrl();
    map.addControl(ctrl);

    const render = () => {
      container.innerHTML = `
        <button class="locate-btn px-3 py-2 bg-white rounded-lg shadow-md border-none cursor-pointer text-xs whitespace-nowrap hover:bg-gray-50">
          ${isSharing ? i18n.t('map.stopSharing') : i18n.t('map.shareLocation')}
        </button>
        <button class="center-btn px-3 py-2 bg-white rounded-lg shadow-md border-none cursor-pointer text-sm hover:bg-gray-50" title="${i18n.t('map.centerOnMe')}">
          📍
        </button>
      `;
      container.querySelector('.locate-btn')!.addEventListener('click', handleLocate);
      container.querySelector('.center-btn')!.addEventListener('click', handleCenter);
    };

    render();
    i18n.on('languageChanged', render);

    return () => {
      map.removeControl(ctrl);
      i18n.off('languageChanged', render);
    };
  }, [map, isSharing, handleLocate, handleCenter]);
  return null;
}

function CenterOnMe() {
  const map = useMap();
  const { isSharing } = useLocationStore();

  useEffect(() => {
    if (!isSharing) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], ZOOM_ME),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, [map, isSharing]);

  return null;
}

function MapClickHandler() {
  const { setActiveUser } = useChatStore();
  useMapEvents({ click: () => setActiveUser(null) });
  return null;
}

function churchIcon(count: number) {
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;background:#f59e0b;width:36px;height:36px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;color:white">⛪<span style="position:absolute;bottom:-4px;right:-6px;background:#ef4444;color:white;font-size:10px;font-weight:bold;min-width:16px;height:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid white">${count}</span></div>`,
    iconSize: [36, 36], iconAnchor: [18, 18],
  });
}

function GroupPopupContent({ members, currentUserStatuses, currentUserId }: { members: UserLocation[]; currentUserStatuses: string[]; currentUserId?: string }) {
  const navigate = useNavigate();
  return (
    <div className="min-w-[200px]">
      {members.map((m) => {
        const canChat = m.user_id !== currentUserId && m.statuses?.includes('readyToChat') && currentUserStatuses.includes('readyToChat');
        return (
          <button key={m.user_id} onClick={() => { if (canChat) navigate(`/chat/${m.user_id}`); }}
            className={`w-full flex flex-col justify-center items-start gap-2 p-0 mb-2 hover:bg-gray-50 rounded text-left ${canChat ? 'cursor-pointer' : 'cursor-default'}`}>
            <div className="flex items-center w-full">
              <span className="text-lg mr-2">{ m.display_icon || '✝' }</span>
              <p className="text-sm font-medium truncate !my-0">{ m.display_name || m.auth_name || 'User' }</p>
              <span className="ml-auto mr-2">{canChat && <span className="text-lg">💬</span>}</span>
            </div>
            <div className="min-w-0 flex-1 ml-3">
              { m.statuses?.length > 0 && (
                <p className="text-xs text-blue-600 !my-0 ml-2">
                  {m.statuses.map((s: string) => statusIcons[s] || '').join(' ')}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PopupContent({ loc, currentUserStatuses, currentUserId }: { loc: UserLocation; currentUserStatuses: string[]; currentUserId?: string }) {
  const navigate = useNavigate();
  const canChat = loc.user_id !== currentUserId && loc.statuses?.includes('readyToChat') && currentUserStatuses.includes('readyToChat');
  const handleChat = () => navigate(`/chat/${loc.user_id}`);
  return (
    <div className="min-w-[200px]">
      <div className="flex gap-2 flex-col items-start">
        <div className="flex items-center w-full mr-2">
          { loc.avatar_url && (
              <img src={ loc.avatar_url } alt="" className="w-10 h-10 rounded-full shrink-0"/>
          ) }
          <p className="font-medium text-sm mt-0">{ loc.display_name || loc.auth_name || 'User' }</p>
        </div>
        <div className="w-full ml-3">
          { loc.denomination && (
              <p className="text-xs !my-0 text-gray-500">{i18n.t(`profile.denominations.${loc.denomination}`)}</p>
          )}
          {loc.statuses?.length > 0 && (
            <p className="text-xs text-blue-600 !my-0">
              {loc.statuses.map((s: string) => statusIcons[s] || '').join(' ')}
            </p>
          )}
        </div>
      </div>
      {canChat && (
        <button onClick={handleChat}
          className="mt-3 bg-blue-600 text-white rounded-full px-4 py-1.5 text-sm font-medium w-full">
          💬 {i18n.t('chat.chatLabel')}
        </button>
      )}
    </div>
  );
}

export function MapPage() {
  const { userLocations, fetchOnlineLocations, startHeartbeat, stopHeartbeat, startSharing } = useLocationStore();
  const { activeUserId } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const prevActive = useRef<string | null>(null);

  useEffect(() => {
    fetchOnlineLocations();
    const interval = setInterval(fetchOnlineLocations, 30000);
    return () => clearInterval(interval);
  }, [fetchOnlineLocations]);

  useEffect(() => {
    startHeartbeat();
    return () => stopHeartbeat();
  }, [startHeartbeat, stopHeartbeat]);

  useEffect(() => {
    if (currentUser?.is_sharing_location) startSharing();
  }, [currentUser, startSharing]);

  useEffect(() => {
    const prev = prevActive.current;
    const curr = activeUserId;

    if (prev && prev !== curr) {
      markerRefs.current.get(prev)?.closePopup();
    }

    if (curr) {
      markerRefs.current.get(curr)?.openPopup();
    }

    prevActive.current = curr;
  }, [activeUserId]);

  const handleMarkerRef = useCallback((userId: string, el: L.Marker | null) => {
    if (el) markerRefs.current.set(userId, el);
    else markerRefs.current.delete(userId);
  }, []);

  const myId = currentUser?.id;
  const grouped = useMemo(() => groupLocations(userLocations), [userLocations]);

  return (
    <div className="relative h-full">
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
                  <GroupPopupContent key={`s-${currentUser?.statuses?.join(',')}`} members={item} currentUserStatuses={currentUser?.statuses || []} currentUserId={currentUser?.id} />
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
            >
              <Popup>
                <PopupContent key={`s-${currentUser?.statuses?.join(',')}`} loc={item} currentUserStatuses={currentUser?.statuses || []} currentUserId={currentUser?.id} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
