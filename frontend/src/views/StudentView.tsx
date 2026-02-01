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
    lastError,
    join,
    submitVote,
    sendMessage,
    clearError,
  } = useSocket();

  const [studentName, setStudentName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [pendingVote, setPendingVote] = useState(false);
  const [optimisticResults, setOptimisticResults] = useState<typeof results | null>(null);

  const { remainingTime: localTime, syncWithServer } = usePollTimer({
    initialSeconds: remainingTime,
    isRunning: true,
  });

  useEffect(() => {
    syncWithServer(remainingTime);
  }, [remainingTime, syncWithServer]);

  useEffect(() => {
    if (!pendingVote || !lastError) return;

    setHasVoted(false);
    setOptimisticResults(null);
    setPendingVote(false);
    clearError();
  }, [pendingVote, lastError, clearError]);

  const displayResults = optimisticResults || results;

  const hasResults = useMemo(() => {
    if (displayResults && displayResults.options.length > 0) return true;
    return hasVoted && !currentPoll;
  }, [displayResults, hasVoted, currentPoll]);

  const handleJoin = () => {
    const name = studentName.trim();
    if (!name) return;

    join(DEFAULT_SESSION_ID, 'student', name);
    setHasJoined(true);
  };

  const handleSubmitVote = () => {
    if (!currentPoll || !selectedOption) return;

    const baseResults = results?.options || currentPoll.options.map((option) => ({
      option,
      votes: 0,
      percentage: 0,
    }));

    const updated = baseResults.map((item) => {
      if (item.option === selectedOption) {
        return { ...item, votes: item.votes + 1 };
      }

      return item;
    });

    const totalVotes = updated.reduce((sum, item) => sum + item.votes, 0);
    const withPercentages = updated.map((item) => ({
      ...item,
      percentage: totalVotes === 0 ? 0 : Math.round((item.votes / totalVotes) * 100),
    }));

    setOptimisticResults({
      pollId: currentPoll._id,
      question: currentPoll.question,
      options: withPercentages,
      totalVotes,
      correctAnswers: currentPoll.correctAnswers || [],
    });
    setPendingVote(true);

    submitVote(currentPoll._id, DEFAULT_SESSION_ID, studentName, selectedOption);
    setHasVoted(true);
  };

  if (isKicked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="animate-fadeIn error-badge max-w-md rounded-3xl border-2 border-red-300 bg-white px-12 py-16 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-4xl shadow-lg">
            🚫
          </div>
          <h1 className="text-3xl font-extrabold text-red-600">You've Been Removed!</h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">You have been removed from this session. Please contact the teacher if this is a mistake.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {!hasJoined ? (
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6">
          <div className="animate-slideUp mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-3xl shadow-xl">
            👋
          </div>
          <h1 className="animate-slideUp text-4xl font-extrabold text-gray-900">Welcome, Student!</h1>
          <p className="animate-slideUp mt-3 text-center text-base text-gray-600">
            Enter your name to join the live polling session.
          </p>

          <div className="animate-slideUp mt-10 w-full max-w-md space-y-5">
            <input
              type="text"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="Enter your name (e.g., John Doe)"
              className="form-input w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 text-base placeholder-gray-400 shadow-sm transition focus:border-primary focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            />
            <button
              type="button"
              onClick={handleJoin}
              className="submit-button w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-base font-extrabold text-white shadow-xl transition"
            >
              🚀 Join Polling Session
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-10">
          <div className="mb-8 flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-lg">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
            <span className="text-sm font-semibold text-gray-700">Connected as <span className="text-purple-600">{studentName}</span></span>
          </div>
          
          {!currentPoll && !hasResults ? (
            <div className="empty-state animate-fadeIn w-full max-w-2xl rounded-3xl border-2 border-purple-200 bg-white px-8 py-20 shadow-xl">
              <div className="empty-state-icon mx-auto mb-6 text-5xl">
                ⏳
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Waiting for Question...</h2>
              <p className="mt-3 text-base text-gray-600">The teacher will start a poll soon. Stay on this page!</p>
              <div className="mt-8 flex justify-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500" style={{animationDelay: '0.2s'}}></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500" style={{animationDelay: '0.4s'}}></div>
              </div>
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

          {hasResults && (displayResults || currentPoll) ? (
            <PollCard
              question={displayResults?.question || currentPoll?.question || 'Results'}
              options={displayResults?.options.map((item) => item.option) || currentPoll?.options || []}
              mode="results"
              results={displayResults || undefined}
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
