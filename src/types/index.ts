export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  display_name: string;
  avatar_url: string | null;
  denomination: string | null;
  faith_type: 'christian' | 'other';
  interests: string[];
  statuses: string[];
  location_lat: number | null;
  location_lng: number | null;
  location_updated_at: string | null;
  is_sharing_location: boolean;
  is_online: boolean;
  last_seen_at: string;
  blocked_user_ids: string[];
  language: 'ru' | 'be' | 'en';
}

export interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
}

export interface UserLocation {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  updated_at: string;
  is_sharing: boolean;
  display_name: string;
  avatar_url: string | null;
  denomination: string | null;
  statuses: string[];
  is_online: boolean;
}
