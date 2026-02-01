import type { PollResults, VotePercentage } from '../hooks/useSocket';

interface PollCardProps {
  question: string;
  options: string[];
  remainingTime?: number;
  mode: 'active' | 'results';
  selectedOption?: string | null;
  onSelectOption?: (option: string) => void;
  onSubmit?: () => void;
  results?: PollResults | null;
}

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const mm = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const ss = String(safeSeconds % 60).padStart(2, '0');

  return `${mm}:${ss}`;
};

const getResultForOption = (results: VotePercentage[] | undefined, option: string) => {
  if (!results) return { votes: 0, percentage: 0 };
  const found = results.find((item) => item.option === option);
  return found || { votes: 0, percentage: 0 };
};

const PollCard = ({
  question,
  options,
  remainingTime = 0,
  mode,
  selectedOption,
  onSelectOption,
  onSubmit,
  results,
}: PollCardProps) => {
  return (
    <div className="poll-container w-full max-w-3xl rounded-3xl border-2 border-purple-200 bg-white p-8 shadow-xl">
      <div className="poll-question-header flex items-center justify-between rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4">
        <span className="text-lg font-bold text-gray-800">{question}</span>
        {mode === 'active' && (
          <span className="timer-badge flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold text-white shadow-lg">
            ⏱️ {formatTime(remainingTime)}
          </span>
        )}
      </div>

      {mode === 'active' ? (
        <div className="mt-8 space-y-4">
          {options.map((option) => {
            const isSelected = selectedOption === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelectOption?.(option)}
                className={`poll-option flex w-full items-center gap-4 rounded-2xl border-2 px-6 py-4 text-left text-base font-semibold transition-all ${
                  isSelected
                    ? 'poll-option-selected border-primary bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 shadow-lg'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md'
                }`}
              >
                <span
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-white shadow-md'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {isSelected ? '✓' : ''}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onSubmit}
            disabled={!selectedOption}
            className="submit-button mt-6 w-full rounded-2xl bg-primary px-6 py-4 text-base font-bold text-white shadow-lg transition"
          >
            🚀 Submit Your Answer
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          <h3 className="text-lg font-bold text-gray-800">📊 Live Results</h3>
          {options.map((option) => {
            const { votes, percentage } = getResultForOption(results?.options, option);

            return (
              <div key={option} className="space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-xs font-bold text-purple-700">
                      {percentage}%
                    </span>
                    {option}
                  </span>
                  <span className="text-xs text-gray-500">{votes} votes</span>
                </div>
                <div className="results-bar">
                  <div
                    className="results-bar-fill progress-bar"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="mt-6 rounded-xl bg-purple-50 px-6 py-4 text-center">
            <p className="text-sm font-semibold text-purple-700">
              Total Votes: <span className="text-lg">{results?.totalVotes || 0}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollCard;
