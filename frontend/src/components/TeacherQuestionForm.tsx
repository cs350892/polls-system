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
    <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900">Let's Get Started</h2>
      <p className="mt-1 text-sm text-gray-600">Create a question for your students.</p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-semibold text-gray-700">Question</label>
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Type your question here"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
            disabled={isDisabled}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Duration</label>
          <div className="mt-2 flex flex-wrap gap-3">
            {durations.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDuration(value)}
                disabled={isDisabled}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  duration === value
                    ? 'border-primary bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {value}s
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-700">Options</label>
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

          <button
            type="button"
            onClick={handleAddOption}
            disabled={isDisabled}
            className="text-sm font-semibold text-purple-700 hover:text-purple-800"
          >
            + Add More
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isDisabled}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask Question
        </button>
      </div>
    </div>
  );
};

export default TeacherQuestionForm;
