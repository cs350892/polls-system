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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Create polls and track responses live.</p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm"
          >
            View Poll History
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {showForm && !hasActivePoll ? (
              <TeacherQuestionForm onSubmit={handleCreatePoll} />
            ) : null}

            {hasActivePoll ? (
              <PollCard
                question={currentPoll?.question || ''}
                options={resultOptions}
                mode="results"
                results={results || undefined}
              />
            ) : null}

            <div className="flex flex-col items-start gap-3">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                disabled={hasActivePoll}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Ask new question
              </button>
              {hasActivePoll ? (
                <p className="text-xs text-gray-500">
                  You already have an active poll. End it before creating a new one.
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
            <p className="mt-1 text-sm text-gray-600">{participantsCount} students online</p>

            <div className="mt-5 space-y-3">
              {participants.filter((p) => p.role === 'student').map((student) => (
                <div
                  key={student.socketId}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700"
                >
                  <span>{student.name}</span>
                  <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700">
                    Student
                  </span>
                </div>
              ))}

              {participantsCount === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-500">
                  Waiting for students to join...
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
