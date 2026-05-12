import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

export function ChatPage() {
  const { t, i18n } = useTranslation();
  const { conversations, messages, activeUserId, setActiveUser, sendMessage, fetchConversations, isLoading } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeUserId) return;
    await sendMessage(activeUserId, input.trim());
    setInput('');
  };

  if (activeUserId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-white">
          <button onClick={() => setActiveUser(null)} className="text-gray-500">←</button>
          <span className="font-medium">{t('chat.chatLabel')}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender_id === user?.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-900'}`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
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
            <button key={conv.id} onClick={() => setActiveUser(conv.other_user_id)} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {conv.other_user.display_name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{conv.other_user.display_name || t('chat.noUser')}</p>
                <p className="text-sm text-gray-500 truncate">{conv.other_user.last_message}</p>
              </div>
            </button>
          ))}
        </div>
      }
    </div>
  );
}
