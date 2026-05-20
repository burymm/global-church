import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Message } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Conversation {
  id: string;
  other_user_id: string;
  other_user: {
    display_name: string;
    avatar_url: string | null;
  };
  last_message: string;
  last_message_at: string;
}

interface ChatState {
  messages: Message[];
  conversations: Conversation[];
  activeUserId: string | null;
  isLoading: boolean;
  _channel: RealtimeChannel | null;
  fetchMessages: (userId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  sendMessage: (userId: string, content: string) => Promise<void>;
  deleteConversation: (userId: string) => Promise<void>;
  markAsDelivered: (messageId: string) => Promise<void>;
  markAsRead: (userId: string) => Promise<void>;
  subscribe: (userId: string) => Promise<void>;
  unsubscribe: () => void;
  setActiveUser: (userId: string | null) => void;
}

function parseMessage(data: any): Message {
  return { ...data, status: data.status || 'sent' };
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversations: [],
  activeUserId: null,
  isLoading: false,
  _channel: null,

  fetchMessages: async (userId: string) => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { set({ isLoading: false }); return; }
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${session.user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${session.user.id})`)
        .order('created_at', { ascending: true })
        .limit(100);
      set({ messages: ((data as any[]) || []).map(parseMessage), isLoading: false });
    } catch {
      set({ messages: [], isLoading: false });
    }
  },

  fetchConversations: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at')
        .or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false })
        .limit(200);
      const userIds = new Set<string>();
      for (const msg of (messages || [])) {
        userIds.add(msg.sender_id === session.user.id ? msg.recipient_id : msg.sender_id);
      }
      if (userIds.size === 0) {
        set({ conversations: [] });
        return;
      }
      const { data: users } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .in('id', Array.from(userIds));
      const userMap = new Map((users || []).map((u: any) => [u.id, u]));
      const convMap = new Map<string, Conversation>();
      for (const msg of (messages || [])) {
        const otherId = msg.sender_id === session.user.id ? msg.recipient_id : msg.sender_id;
        if (!convMap.has(otherId)) {
          const otherUser = userMap.get(otherId);
          convMap.set(otherId, {
            id: otherId,
            other_user_id: otherId,
            other_user: {
              display_name: otherUser?.display_name || '',
              avatar_url: otherUser?.avatar_url || null,
            },
            last_message: msg.content,
            last_message_at: msg.created_at,
          });
        }
      }
      set({ conversations: Array.from(convMap.values()) });
    } catch {
      set({ conversations: [] });
    }
  },

  sendMessage: async (userId: string, content: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const { data } = await supabase.from('messages').insert({ sender_id: session.user.id, recipient_id: userId, content }).select().single();
      if (data) {
        const msg = parseMessage(data);
        set((state) => {
          if (state.messages.some((m) => m.id === msg.id)) return state;
          return { messages: [...state.messages, msg] };
        });
      }
    } catch {}
  },

  deleteConversation: async (userId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${session.user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${session.user.id})`);
    } catch {}
    set((state) => ({
      conversations: state.conversations.filter((c) => c.other_user_id !== userId),
      messages: [],
      activeUserId: null,
    }));
  },

  markAsDelivered: async (messageId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from('messages').update({ status: 'delivered' }).eq('id', messageId).or('status.eq.sent,status.is.null');
    if (error) console.error('markAsDelivered error', error);
    set((state) => ({
      messages: state.messages.map((m) => m.id === messageId && (m.status === 'sent' || !m.status) ? { ...m, status: 'delivered' as const } : m),
    }));
  },

  markAsRead: async (userId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true, status: 'read' })
      .eq('recipient_id', session.user.id)
      .eq('sender_id', userId)
      .neq('is_read', true)
      .select();
    if (error) console.error('markAsRead error', error);
    if (data && data.length > 0) {
      const readIds = new Set(data.map((m: any) => m.id));
      set((state) => ({
        messages: state.messages.map((m) => readIds.has(m.id) ? { ...m, is_read: true, status: 'read' as const } : m),
      }));
    }
  },

  subscribe: async (userId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const channelName = `chat-${userId}-${Date.now()}`;
    const channel = supabase.channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${session.user.id}` },
        (payload) => {
          const newMsg = parseMessage(payload.new as Message);
          const { activeUserId } = get();
          if (newMsg.sender_id === activeUserId || newMsg.sender_id === userId) {
            set((state) => {
              if (state.messages.some((m) => m.id === newMsg.id)) return state;
              return { messages: [...state.messages, newMsg] };
            });
            get().markAsDelivered(newMsg.id);
          }
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `sender_id=eq.${session.user.id}` },
        (payload) => {
          const updated = payload.new as Message;
          set((state) => ({
            messages: state.messages.map((m) => m.id === updated.id ? { ...m, is_read: updated.is_read, status: updated.status || m.status } : m),
          }));
        })
      .subscribe();
    set({ _channel: channel });
  },

  unsubscribe: async () => {
    const { _channel } = get();
    if (_channel) { await supabase.removeChannel(_channel); }
  },

  setActiveUser: async (userId: string | null) => {
    await get().unsubscribe();
    set({ activeUserId: userId });
    if (userId) {
      await get().fetchMessages(userId);
      get().markAsRead(userId);
      get().subscribe(userId);
    }
  },
}));
