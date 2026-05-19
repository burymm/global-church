import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function ChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { conversations, messages, activeUserId, setActiveUser, sendMessage, deleteConversation, fetchConversations, isLoading } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [guard, setGuard] = useState<'loading' | 'allowed' | 'noUser' | 'noAccess'>('loading');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!userId) {
      if (activeUserId) setActiveUser(null);
      setGuard('loading');
      return;
    }

    const existingConv = conversations.find((c) => c.other_user_id === userId);
    if (existingConv) {
      setGuard('allowed');
      setActiveUser(userId);
      return;
    }

    const checkAccess = async () => {
      const { data: targetUser } = await supabase
        .from('users')
        .select('statuses')
        .eq('id', userId)
        .maybeSingle();
      if (!targetUser) {
        setGuard('noUser');
        return;
      }
      const myStatuses = currentUser?.statuses || [];
      const hasAccess = myStatuses.includes('readyToChat') && targetUser.statuses?.includes('readyToChat');
      if (hasAccess) {
        setGuard('allowed');
        setActiveUser(userId);
      } else {
        setGuard('noAccess');
      }
    };
    checkAccess();
  }, [userId, conversations]);

  const handleSend = async () => {
    if (!input.trim() || !userId) return;
    await sendMessage(userId, input.trim());
    setInput('');
  };

  const handleDelete = () => {
    if (!userId) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userId) return;
    await deleteConversation(userId);
    setShowDeleteConfirm(false);
    navigate('/chat');
  };

  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setUserName(null); return; }
    const conv = conversations.find((c) => c.other_user_id === userId);
    if (conv) { setUserName(conv.other_user.display_name); return; }
    supabase.from('users').select('display_name').eq('id', userId).maybeSingle().then(({ data }) => {
      if (data) setUserName(data.display_name);
    });
  }, [userId, conversations]);

  if (userId && guard === 'noUser') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-white">
          <button onClick={() => navigate('/chat')} className="text-gray-500">←</button>
          <span className="font-medium">{t('chat.chatLabel')}</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-400 text-center">{t('chat.userNotFound')}</p>
        </div>
      </div>
    );
  }

  if (userId && guard === 'noAccess') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-white">
          <button onClick={() => navigate('/chat')} className="text-gray-500">←</button>
          <span className="font-medium">{t('chat.chatLabel')}</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-400 text-center">{t('chat.chatUnavailable')}</p>
        </div>
      </div>
    );
  }

  if (userId && guard === 'loading') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-white">
          <button onClick={() => navigate('/chat')} className="text-gray-500">←</button>
          <span className="font-medium">{t('chat.chatLabel')}</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">{t('chat.loading')}</p>
        </div>
      </div>
    );
  }

  if (userId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-white">
          <button onClick={() => navigate('/chat')} className="text-gray-500">←</button>
          <span className="font-medium flex-1 truncate">{userName || t('chat.chatLabel')}</span>
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 text-sm" title={t('chat.deleteChat')}>🗑</button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2 rounded-2xl break-words ${msg.sender_id === currentUser?.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'}`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${msg.sender_id === currentUser?.id ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                  {msg.sender_id === currentUser?.id && (
                    msg.status === 'read' ? <span className="text-blue-300"><span>✓</span><span className="-ml-[0.4rem]">✓</span></span> :
                    msg.status === 'delivered' ? <span><span>✓</span><span className="-ml-[0.4rem]">✓</span></span> :
                    <span>✓</span>
                  )}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2 p-3 border-t border-gray-200 bg-white safe-bottom">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat.typeMessage')}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={handleSend} className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center">→</button>
        </div>
        <ConfirmDialog
          open={showDeleteConfirm}
          title={t('chat.deleteChat')}
          message={t('chat.deleteConfirm')}
          confirmLabel={t('chat.deleteChat')}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <h1 className="text-xl font-bold p-4">{t('chat.title')}</h1>
      {isLoading ? <p className="text-center text-gray-400 mt-8">{t('chat.loading')}</p> :
        conversations.length === 0 ?
        <p className="text-center text-gray-400 mt-8 px-4">{t('chat.noConversations')}</p> :
        <div className="divide-y divide-gray-100">
          {conversations.map((conv: any) => (
            <button key={conv.id} onClick={() => navigate(`/chat/${conv.other_user_id}`)} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {conv.other_user.display_name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{conv.other_user.display_name || t('chat.noUser')}</p>
                <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
              </div>
            </button>
          ))}
        </div>
      }
    </div>
  );
}
