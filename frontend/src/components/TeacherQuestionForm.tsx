import { useMemo, useState } from 'react';
import OptionInput from './OptionInput';

interface TeacherQuestionFormProps {
  isDisabled?: boolean;
  onSubmit: (payload: {
    question: string;
    options: string[];
    duration: number;
    correctAnswers: string[];
  }) => void;
}

const durations = [30, 60, 90];

const TeacherQuestionForm = ({ isDisabled = false, onSubmit }: TeacherQuestionFormProps) => {
  const [question, setQuestion] = useState('');
  const [duration, setDuration] = useState(60);
  const [options, setOptions] = useState<string[]>(['', '']);
  const [correctMap, setCorrectMap] = useState<boolean[]>([false, false]);

  const isValid = useMemo(() => {
    const trimmedQuestion = question.trim();
    const validOptions = options.map((opt) => opt.trim()).filter(Boolean);

    return trimmedQuestion.length > 0 && validOptions.length >= 2;
  }, [question, options]);

  const handleOptionChange = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const handleCorrectChange = (index: number, value: boolean) => {
    const next = [...correctMap];
    next[index] = value;
    setCorrectMap(next);
  };

  const handleAddOption = () => {
    setOptions((prev) => [...prev, '']);
    setCorrectMap((prev) => [...prev, false]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setCorrectMap((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!isValid || isDisabled) return;

    const cleanedOptions = options.map((opt) => opt.trim()).filter(Boolean);
    const correctAnswers = cleanedOptions.filter((_, index) => correctMap[index]);

    onSubmit({
      question: question.trim(),
      options: cleanedOptions,
      duration,
      correctAnswers,
    });

    setQuestion('');
    setOptions(['', '']);
    setCorrectMap([false, false]);
    setDuration(60);
  };

  return (
    <div className="w-full max-w-3xl animate-slideUp rounded-3xl border-2 border-purple-200 bg-white p-8 shadow-xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-2xl shadow-lg">
          📝
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Create New Poll</h2>
          <p className="text-sm text-gray-600">Design an engaging question for your students</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What is your question for students?"
            className="form-input w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-base placeholder-gray-400 transition focus:border-primary focus:outline-none"
            disabled={isDisabled}
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-bold text-gray-700">
            Duration <span className="text-xs font-normal text-gray-500">(seconds)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {durations.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDuration(value)}
                disabled={isDisabled}
                className={`duration-pill rounded-xl border-2 px-6 py-3 text-sm font-bold transition ${
                  duration === value
                    ? 'duration-pill-active border-primary bg-purple-100 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200 hover:bg-purple-50'
                }`}
              >
                ⏱️ {value}s
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-700">
            Answer Options <span className="text-red-500">*</span>
            <span className="ml-2 text-xs font-normal text-gray-500">(minimum 2 required)</span>
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <OptionInput
                key={`option-${index}`}
                index={index}
                value={option}
                isCorrect={correctMap[index]}
                onChange={(value) => handleOptionChange(index, value)}
                onCorrectChange={(value) => handleCorrectChange(index, value)}
                onRemove={options.length > 2 ? () => handleRemoveOption(index) : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddOption}
            disabled={isDisabled}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-purple-600 transition hover:bg-purple-50"
          >
            <span className="text-xl">+</span> Add More Options
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isDisabled}
          className="submit-button mt-8 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-lg font-extrabold text-white shadow-xl transition"
        >
          🚀 Create Poll & Send to Students
        </button>
      </div>
    </div>
  );
};

export default TeacherQuestionForm;
