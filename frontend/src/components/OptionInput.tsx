interface OptionInputProps {
  index: number;
  value: string;
  isCorrect: boolean;
  onChange: (value: string) => void;
  onCorrectChange: (value: boolean) => void;
  onRemove?: () => void;
}

const OptionInput = ({
  index,
  value,
  isCorrect,
  onChange,
  onCorrectChange,
  onRemove,
}: OptionInputProps) => {
  return (
    <div className="animate-fadeIn rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm transition hover:border-purple-200 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-xs font-bold text-purple-700">
            {index + 1}
          </span>
          <span className="text-sm font-bold text-gray-700">Option {index + 1}</span>
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
          >
            🗑️ Remove
          </button>
        ) : null}
      </div>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Enter option ${index + 1} (e.g., Apple, Banana, Orange)`}
        className="form-input w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm placeholder-gray-400 transition focus:border-primary focus:outline-none"
      />

      <div className="mt-4 flex items-center gap-6 rounded-lg bg-purple-50 px-4 py-3">
        <span className="text-xs font-bold text-gray-700">Mark as Correct Answer?</span>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            checked={isCorrect}
            onChange={() => onCorrectChange(true)}
            className="h-4 w-4 accent-primary cursor-pointer"
          />
          <span className="text-sm font-semibold text-green-600">✓ Yes</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            checked={!isCorrect}
            onChange={() => onCorrectChange(false)}
            className="h-4 w-4 accent-gray-400 cursor-pointer"
          />
          <span className="text-sm font-semibold text-gray-600">✗ No</span>
        </label>
      </div>
    </div>
  );
};

export default OptionInput;
