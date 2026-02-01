import { useEffect, useMemo, useState } from 'react';
import useSocket from '../hooks/useSocket';
import PollCard from '../components/PollCard';
import TeacherQuestionForm from '../components/TeacherQuestionForm';
import ChatModal from '../components/ChatModal';

const DEFAULT_SESSION_ID = 'default';

const TeacherDashboard = () => {
  const {
    currentPoll,
    results,
    messages,
    participants,
    join,
    createPoll,
    sendMessage,
    kickStudent,
  } = useSocket();

  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    join(DEFAULT_SESSION_ID, 'teacher');
  }, []);

  const hasActivePoll = Boolean(currentPoll);

  const participantsCount = participants.filter((p) => p.role === 'student').length;

  const resultOptions = useMemo(() => {
    if (results?.options?.length) {
      return results.options.map((item) => item.option);
    }

    return currentPoll?.options || [];
  }, [results, currentPoll]);

  const handleCreatePoll = (payload: {
    question: string;
    options: string[];
    duration: number;
    correctAnswers: string[];
  }) => {
    if (hasActivePoll) {
      return;
    }

    createPoll(
      DEFAULT_SESSION_ID,
      payload.question,
      payload.options,
      payload.duration,
      'teacher'
    );

    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="animate-slideUp mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-3xl shadow-lg">
              👨‍🏫
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Teacher Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Create polls and track student responses in real-time</p>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border-2 border-purple-200 bg-white px-5 py-3 text-sm font-bold text-purple-700 shadow-sm transition hover:bg-purple-50 hover:shadow-md"
          >
            📜 View Poll History
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {showForm && !hasActivePoll ? (
              <TeacherQuestionForm onSubmit={handleCreatePoll} />
            ) : null}

            {hasActivePoll ? (
              <div className="animate-fadeIn">
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-white px-5 py-3 shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-xl">
                    ✅
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Active Poll Running</p>
                    <p className="text-xs text-gray-600">Students are voting now...</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    <span className="text-xs font-semibold text-green-600">LIVE</span>
                  </div>
                </div>
                <PollCard
                  question={currentPoll?.question || ''}
                  options={resultOptions}
                  mode="results"
                  results={results || undefined}
                />
              </div>
            ) : null}

            <div className="flex flex-col items-start gap-4">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                disabled={hasActivePoll}
                className="submit-button flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition"
              >
                ➕ Create New Question
              </button>
              {hasActivePoll ? (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2 text-xs font-medium text-yellow-800">
                  ⚠️ You already have an active poll. Wait for it to complete before creating a new one.
                </div>
              ) : null}
            </div>
          </div>

          <div className="animate-fadeIn rounded-3xl border-2 border-purple-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">👥 Participants</h2>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-bold text-purple-600">{participantsCount}</span> students online
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-lg font-bold text-purple-700">
                {participantsCount}
              </div>
            </div>

            <div className="max-h-[500px] space-y-2 overflow-y-auto">
              {participants.filter((p) => p.role === 'student').map((student, index) => (
                <div
                  key={student.socketId}
                  className="participant-item animate-fadeIn flex items-center justify-between rounded-xl border-2 border-gray-100 bg-gradient-to-r from-white to-purple-50 px-4 py-3 shadow-sm transition"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-200 font-bold text-purple-700">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800">{student.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="participant-online relative rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Online
                    </span>
                    <button
                      type="button"
                      onClick={() => kickStudent(DEFAULT_SESSION_ID, student.socketId)}
                      className="rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      title="Remove student"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {participantsCount === 0 ? (
                <div className="empty-state rounded-2xl border-2 border-dashed border-gray-200 px-4 py-12 text-center">
                  <div className="empty-state-icon mx-auto mb-4 text-4xl">
                    👥
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No students yet</p>
                  <p className="mt-1 text-xs text-gray-400">Waiting for students to join...</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <ChatModal
        role="teacher"
        sessionId={DEFAULT_SESSION_ID}
        pollId={currentPoll?._id}
        currentUserName="teacher"
        messages={messages}
        participants={participants}
        onSendMessage={sendMessage}
        onKickStudent={kickStudent}
      />
    </div>
  );
};

export default TeacherDashboard;
