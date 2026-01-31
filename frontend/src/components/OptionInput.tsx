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
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Option {index + 1}</span>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-semibold text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        ) : null}
      </div>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Option ${index + 1}`}
        className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />

      <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-600">
        <span>Is it Correct?</span>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={isCorrect}
            onChange={() => onCorrectChange(true)}
            className="h-4 w-4 accent-primary"
          />
          Yes
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={!isCorrect}
            onChange={() => onCorrectChange(false)}
            className="h-4 w-4 accent-primary"
          />
          No
        </label>
      </div>
    </div>
  );
};

export default OptionInput;
