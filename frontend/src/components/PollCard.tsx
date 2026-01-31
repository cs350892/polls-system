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
    <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
        <span>{question}</span>
        {mode === 'active' && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
            {formatTime(remainingTime)}
          </span>
        )}
      </div>

      {mode === 'active' ? (
        <div className="mt-6 space-y-4">
          {options.map((option) => {
            const isSelected = selectedOption === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelectOption?.(option)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                  isSelected
                    ? 'border-primary bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                    isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {isSelected ? '●' : '○'}
                </span>
                {option}
              </button>
            );
          })}

          <button
            type="button"
            onClick={onSubmit}
            disabled={!selectedOption}
            className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {options.map((option) => {
            const { votes, percentage } = getResultForOption(results?.options, option);

            return (
              <div key={option} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>{option}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100">
                  <div
                    className="h-3 rounded-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">{votes} votes</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PollCard;
