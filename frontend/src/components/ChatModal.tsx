import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage, Participant, Role } from '../hooks/useSocket';

interface ChatModalProps {
  role: Role;
  sessionId: string;
  pollId?: string | null;
  currentUserName?: string;
  messages: ChatMessage[];
  participants: Participant[];
  onSendMessage: (pollId: string, sessionId: string, from: string, text: string) => void;
  onKickStudent?: (sessionId: string, targetSocketId: string) => void;
}

const ChatModal = ({
  role,
  sessionId,
  pollId,
  currentUserName,
  messages,
  participants,
  onSendMessage,
  onKickStudent,
}: ChatModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
  const [text, setText] = useState('');
  const modalRef = useRef<HTMLDivElement | null>(null);

  const currentId = useMemo(() => pollId || 'lobby', [pollId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      const target = event.target as Node;
      if (modalRef.current && !modalRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSend = () => {
    const message = text.trim();
    if (!message) return;

    onSendMessage(currentId, sessionId, currentUserName || 'anonymous', message);
    setText('');
  };

  const filteredMessages = useMemo(
    () => messages.filter((message) => message.pollId === currentId),
    [messages, currentId]
  );

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn-hover-lift flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-3xl text-white shadow-2xl transition hover:shadow-3xl"
        aria-label="Open chat"
      >
        💬
      </button>

      {isOpen ? (
        <div
          ref={modalRef}
          className="chat-modal absolute bottom-20 right-0 w-[360px] overflow-hidden rounded-3xl border-2 border-purple-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b-2 border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-purple-50'
                }`}
              >
                💬 Chat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('participants')}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  activeTab === 'participants'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-purple-50'
                }`}
              >
                👥 Users
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-600 transition hover:bg-gray-200"
            >
              ✕
            </button>
          </div>

          {activeTab === 'chat' ? (
            <div className="flex h-[400px] flex-col bg-gradient-to-b from-white to-purple-50">
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin">
                {filteredMessages.length === 0 ? (
                  <div className="empty-state py-12 text-center">
                    <div className="text-3xl">💬</div>
                    <p className="mt-2 text-xs font-semibold text-gray-400">No messages yet</p>
                    <p className="text-xs text-gray-400">Start the conversation!</p>
                  </div>
                ) : (
                  filteredMessages.map((message, index) => {
                    const isMine =
                      currentUserName && message.from.toLowerCase() === currentUserName.toLowerCase();

                    return (
                      <div
                        key={`${message.timestamp}-${index}`}
                        className={`chat-bubble flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                            isMine
                              ? 'chat-bubble-right bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                              : 'chat-bubble-left bg-white text-gray-700'
                          }`}
                        >
                          <div className={`text-[10px] font-bold ${isMine ? 'text-purple-200' : 'text-purple-600'}`}>
                            {message.from}
                          </div>
                          <div className="mt-1 font-medium">{message.text}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-center gap-2 border-t-2 border-purple-100 bg-white px-4 py-4">
                <input
                  type="text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="form-input flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="submit-button rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[400px] overflow-y-auto bg-gradient-to-b from-white to-purple-50 px-4 py-4">
              {participants.filter((p) => p.role === 'student').length === 0 ? (
                <div className="empty-state py-12 text-center">
                  <div className="text-4xl">👥</div>
                  <p className="mt-2 text-sm font-semibold text-gray-400">No students online</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {participants
                    .filter((p) => p.role === 'student')
                    .map((participant, index) => (
                      <div
                        key={participant.socketId}
                        className="participant-item animate-fadeIn flex items-center justify-between rounded-xl border-2 border-gray-100 bg-white px-4 py-3 shadow-sm transition"
                        style={{animationDelay: `${index * 0.05}s`}}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-sm font-bold text-white shadow-md">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{participant.name}</span>
                        </div>
                        {role === 'teacher' && onKickStudent ? (
                          <button
                            type="button"
                            onClick={() => onKickStudent(sessionId, participant.socketId)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 hover:shadow-md"
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="participant-online relative rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            Online
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ChatModal;
