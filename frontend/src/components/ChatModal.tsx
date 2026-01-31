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
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-white shadow-lg"
        aria-label="Open chat"
      >
        💬
      </button>

      {isOpen ? (
        <div
          ref={modalRef}
          className="absolute bottom-16 right-0 w-[320px] rounded-2xl border border-gray-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex gap-2 text-sm font-semibold text-gray-700">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`rounded-full px-3 py-1 ${
                  activeTab === 'chat' ? 'bg-purple-100 text-purple-700' : 'text-gray-500'
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('participants')}
                className={`rounded-full px-3 py-1 ${
                  activeTab === 'participants'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500'
                }`}
              >
                Participants
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>

          {activeTab === 'chat' ? (
            <div className="flex h-80 flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {filteredMessages.length === 0 ? (
                  <div className="text-center text-xs text-gray-400">No messages yet</div>
                ) : (
                  filteredMessages.map((message, index) => {
                    const isMine =
                      currentUserName && message.from.toLowerCase() === currentUserName.toLowerCase();

                    return (
                      <div
                        key={`${message.timestamp}-${index}`}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs ${
                            isMine
                              ? 'bg-primary text-white'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          <div className="text-[10px] opacity-70">{message.from}</div>
                          <div>{message.text}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-3">
                <input
                  type="text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-gray-200 px-3 py-2 text-xs focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-4">
              {participants.filter((p) => p.role === 'student').length === 0 ? (
                <div className="text-center text-xs text-gray-400">No students yet</div>
              ) : (
                participants
                  .filter((p) => p.role === 'student')
                  .map((participant) => (
                    <div
                      key={participant.socketId}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-xs text-gray-700"
                    >
                      <span>{participant.name}</span>
                      {role === 'teacher' && onKickStudent ? (
                        <button
                          type="button"
                          onClick={() => onKickStudent(sessionId, participant.socketId)}
                          className="rounded-full border border-red-200 px-2 py-1 text-[10px] font-semibold text-red-500"
                        >
                          Kick out
                        </button>
                      ) : null}
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ChatModal;
