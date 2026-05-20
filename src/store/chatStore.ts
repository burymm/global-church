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
  unread_count: number;
}

interface ChatState {
  messages: Message[];
  conversations: Conversation[];
  activeUserId: string | null;
  isLoading: boolean;
  _channel: RealtimeChannel | null;
  _globalChannel: RealtimeChannel | null;
  _sessionUserId: string | null;
  init: () => Promise<void>;
  destroy: () => Promise<void>;
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

function sortConversations(list: Conversation[]): Conversation[] {
  return list.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
}

function upsertConversation(
  list: Conversation[],
  otherUserId: string,
  otherUser: { display_name: string; avatar_url: string | null },
  last_message: string,
  last_message_at: string,
  unreadDelta: number,
): Conversation[] {
  const idx = list.findIndex((c) => c.other_user_id === otherUserId);
  const existing = idx >= 0 ? list[idx] : null;
  const updated: Conversation = {
    id: otherUserId,
    other_user_id: otherUserId,
    other_user: existing ? existing.other_user : otherUser,
    last_message,
    last_message_at,
    unread_count: (existing?.unread_count || 0) + unreadDelta,
  };
  const next = idx >= 0 ? [...list] : [...list];
  if (idx >= 0) next[idx] = updated;
  else next.push(updated);
  return sortConversations(next);
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversations: [],
  activeUserId: null,
  isLoading: false,
  _channel: null,
  _globalChannel: null,
  _sessionUserId: null,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    set({ _sessionUserId: session.user.id });
    await get().fetchConversations();

    const channel = supabase.channel('conversations-global')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as any;
          const userId = get()._sessionUserId;
          if (!userId) return;
          if (msg.sender_id !== userId && msg.recipient_id !== userId) return;

          const otherUserId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
          const isActive = get().activeUserId === otherUserId;
          const unreadDelta = msg.recipient_id === userId && !isActive ? 1 : 0;

          set((state) => ({
            conversations: upsertConversation(
              state.conversations,
              otherUserId,
              state.conversations.find((c) => c.other_user_id === otherUserId)?.other_user || { display_name: '', avatar_url: null },
              msg.content,
              msg.created_at,
              unreadDelta,
            ),
          }));
        })
      .subscribe();
    set({ _globalChannel: channel });
  },

  destroy: async () => {
    const { _globalChannel, _channel } = get();
    if (_globalChannel) await supabase.removeChannel(_globalChannel);
    if (_channel) await supabase.removeChannel(_channel);
    set({ _globalChannel: null, _channel: null, _sessionUserId: null, conversations: [], messages: [], activeUserId: null });
  },

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
      const parsed = ((data as any[]) || []).map(parseMessage);
      set({ messages: parsed, isLoading: false });
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
        .select('sender_id, recipient_id, content, created_at, is_read')
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
            unread_count: 0,
          });
        }
      }
      for (const msg of (messages || [])) {
        if (msg.recipient_id === session.user.id && !msg.is_read) {
          const otherId = msg.sender_id;
          const conv = convMap.get(otherId);
          if (conv) conv.unread_count++;
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
          const messages = state.messages.some((m) => m.id === msg.id)
            ? state.messages
            : [...state.messages, msg];
          const conversations = upsertConversation(
            state.conversations, userId,
            state.conversations.find((c) => c.other_user_id === userId)?.other_user || { display_name: '', avatar_url: null },
            content, msg.created_at, 0,
          );
          return { messages, conversations };
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
          const unreadDelta = newMsg.sender_id === activeUserId ? 0 : 1;
          set((state) => {
            const messages = state.messages.some((m) => m.id === newMsg.id)
              ? state.messages
              : [...state.messages, newMsg];
            const conversations = upsertConversation(
              state.conversations, newMsg.sender_id,
              state.conversations.find((c) => c.other_user_id === newMsg.sender_id)?.other_user || { display_name: '', avatar_url: null },
              newMsg.content, newMsg.created_at, unreadDelta,
            );
            return { messages, conversations };
          });
          if (newMsg.sender_id === activeUserId || newMsg.sender_id === userId) {
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
    set({ _channel: null });
  },

  setActiveUser: async (userId: string | null) => {
    await get().unsubscribe();
    if (userId) {
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.other_user_id === userId ? { ...c, unread_count: 0 } : c
        ),
      }));
    }
    set({ activeUserId: userId });
    if (userId) {
      await get().fetchMessages(userId);
      get().markAsRead(userId);
      get().subscribe(userId);
    }
  },
}));
