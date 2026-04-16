import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Send, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from '../../shared/components/Layout';
import useAuth from '../../shared/hooks/useAuth';
import { getConversationMessages, sendMessage } from '../../core/api/messagingApi';
import { getAuthUserById } from '../../core/api/userApi';
import { AuthUser, Message, RouteLocationState } from '../../types';

const MESSAGING_WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8086/ws';

const Chat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as RouteLocationState;
  const { userId } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<AuthUser | null>(null);
  const [resolvedOtherUserId, setResolvedOtherUserId] = useState<number | null>(
    state.otherUserId || null
  );
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    getConversationMessages(Number(conversationId))
      .then((res) => {
        const payload = res.data as Message[] | { data?: Message[] };
        const loaded = Array.isArray(payload) ? payload : payload.data || [];
        setMessages(loaded);
        if (!state.otherUserId && loaded.length > 0 && userId) {
          const derivedId = loaded.find((message) => message.senderId !== userId)?.senderId;
          if (derivedId) {
            setResolvedOtherUserId(derivedId);
          }
        }
      })
      .catch(() => toast.error('Failed to load messages'));
  }, [conversationId, state.otherUserId, userId]);

  useEffect(() => {
    if (!resolvedOtherUserId) {
      return;
    }

    getAuthUserById(resolvedOtherUserId)
      .then((res) => setOtherUser(res.data))
      .catch(() => undefined);
  }, [resolvedOtherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(MESSAGING_WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/conversation/${conversationId}`, (frame: IMessage) => {
          const newMessage = JSON.parse(frame.body) as Message;
          setMessages((prev) => {
            if (prev.some((message) => message.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
      setConnected(false);
    };
  }, [conversationId]);

  const handleSend = async (): Promise<void> => {
    if (!text.trim() || !resolvedOtherUserId) {
      return;
    }

    setSending(true);
    const content = text;
    setText('');

    try {
      await sendMessage({ receiverId: resolvedOtherUserId, content });
    } catch {
      toast.error('Failed to send');
      setText(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)]">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/messages')}
              className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {otherUser?.name ||
                  otherUser?.email ||
                  (resolvedOtherUserId
                    ? `User #${resolvedOtherUserId}`
                    : `Conversation #${conversationId}`)}
              </h1>
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
              connected ? 'bg-green-500/15 text-green-400' : 'bg-dark-600 text-gray-500'
            }`}
          >
            {connected ? (
              <>
                <Wifi size={12} /> Live
              </>
            ) : (
              <>
                <WifiOff size={12} /> Connecting...
              </>
            )}
          </div>
        </div>

        <div className="card flex-1 overflow-y-auto p-4 space-y-3 mb-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    message.senderId === userId
                      ? 'bg-accent text-white rounded-br-md'
                      : 'bg-dark-600 text-gray-200 border border-dark-400 rounded-bl-md'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="Type a message..."
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
          />
          <button
            onClick={() => void handleSend()}
            disabled={sending || !text.trim() || !resolvedOtherUserId}
            className="btn-primary px-4 flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
