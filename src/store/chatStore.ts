import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Message } from '../types';

interface ChatState {
  messages: Message[];
  conversations: any[];
  activeUserId: string | null;
  isLoading: boolean;
  _channel: any;
  fetchMessages: (userId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  sendMessage: (userId: string, content: string) => Promise<void>;
  subscribe: (userId: string) => Promise<void>;
  unsubscribe: () => void;
  setActiveUser: (userId: string | null) => void;
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
    if (!session) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true })
      .limit(100);
    set({ messages: data as Message[] || [], isLoading: false });
  },

  fetchConversations: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: messages } = await supabase
      .from('messages')
      .select('sender_id, recipient_id, content, created_at')
      .or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false })
      .limit(200);
    const convMap = new Map();
    for (const msg of (messages || [])) {
      const otherId = msg.sender_id === session.user.id ? msg.recipient_id : msg.sender_id;
      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          id: otherId, user_id: session.user.id, other_user_id: otherId,
          other_user: { display_name: '', avatar_url: null, last_message: msg.content, last_message_at: msg.created_at },
        });
      }
    }
    set({ conversations: Array.from(convMap.values()) });
  },

  sendMessage: async (userId: string, content: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('messages').insert({ sender_id: session.user.id, recipient_id: userId, content });
  },

  subscribe: async (userId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const channel = supabase.channel('chat-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${session.user.id}` },
        (payload) => {
          const newMsg = payload.new as Message;
          const { messages, activeUserId } = get();
          if (newMsg.sender_id === activeUserId || newMsg.sender_id === userId) set({ messages: [...messages, newMsg] });
        })
      .subscribe();
    set({ _channel: channel });
  },

  unsubscribe: () => {
    const state = get() as any;
    if (state._channel) { supabase.removeChannel(state._channel); }
  },

  setActiveUser: (userId: string | null) => {
    get().unsubscribe();
    set({ activeUserId: userId });
    if (userId) { get().fetchMessages(userId); get().subscribe(userId); }
  },
}));
