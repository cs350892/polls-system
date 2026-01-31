import { useEffect, useMemo, useState } from 'react';
import useSocket from '../hooks/useSocket';
import usePollTimer from '../hooks/usePollTimer';
import PollCard from '../components/PollCard';
import ChatModal from '../components/ChatModal';

const DEFAULT_SESSION_ID = 'default';

const StudentView = () => {
  const {
    currentPoll,
    remainingTime,
    results,
    messages,
    participants,
    isKicked,
    join,
    submitVote,
    sendMessage,
  } = useSocket();

  const [studentName, setStudentName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const { remainingTime: localTime, syncWithServer } = usePollTimer({
    initialSeconds: remainingTime,
    isRunning: true,
  });

  useEffect(() => {
    syncWithServer(remainingTime);
  }, [remainingTime, syncWithServer]);

  const hasResults = useMemo(() => {
    if (results && results.options.length > 0) return true;
    return hasVoted && !currentPoll;
  }, [results, hasVoted, currentPoll]);

  const handleJoin = () => {
    const name = studentName.trim();
    if (!name) return;

    join(DEFAULT_SESSION_ID, 'student', name);
    setHasJoined(true);
  };

  const handleSubmitVote = () => {
    if (!currentPoll || !selectedOption) return;

    submitVote(currentPoll._id, DEFAULT_SESSION_ID, studentName, selectedOption);
    setHasVoted(true);
  };

  if (isKicked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl border border-red-200 bg-white px-10 py-12 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-red-600">You've been Kicked out!</h1>
          <p className="mt-2 text-sm text-gray-600">Please contact the teacher if this is a mistake.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!hasJoined ? (
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6">
          <h1 className="text-3xl font-bold text-gray-900">Let's Get Started</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your name to join the live poll.
          </p>

          <div className="mt-8 w-full space-y-4">
            <input
              type="text"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={handleJoin}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-10">
          {!currentPoll && !hasResults ? (
            <div className="relative flex w-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Wait for the teacher to ask a question...</h2>
              <p className="mt-2 text-sm text-gray-600">Stay here. You'll see the poll appear automatically.</p>
            </div>
          ) : null}

          {currentPoll && !hasResults ? (
            <PollCard
              question={currentPoll.question}
              options={currentPoll.options}
              remainingTime={localTime}
              mode="active"
              selectedOption={selectedOption}
              onSelectOption={setSelectedOption}
              onSubmit={handleSubmitVote}
            />
          ) : null}

          {hasResults && (results || currentPoll) ? (
            <PollCard
              question={results?.question || currentPoll?.question || 'Results'}
              options={results?.options.map((item) => item.option) || currentPoll?.options || []}
              mode="results"
              results={results || undefined}
            />
          ) : null}
        </div>
      )}
      {hasJoined ? (
        <ChatModal
          role="student"
          sessionId={DEFAULT_SESSION_ID}
          pollId={currentPoll?._id}
          currentUserName={studentName}
          messages={messages}
          participants={participants}
          onSendMessage={sendMessage}
        />
      ) : null}
    </div>
  );
};

export default StudentView;
