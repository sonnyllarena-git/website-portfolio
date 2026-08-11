export default function MultipleChoiceOptions({ options, onSelect, disabled, selected }) {
  if (selected) {
    return (
      <p className="mt-2 text-xs italic text-black/50 dark:text-white/50">
        Selected: {selected}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 mt-2 w-full">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="flex items-center gap-2 text-xs text-left px-3 py-2 rounded-lg border border-accent/40 text-accent hover:bg-accent hover:text-white hover:border-accent transition-colors duration-200 ease-in-out disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="font-bold shrink-0">{option.label}.</span>
          <span>{option.text}</span>
        </button>
      ))}
    </div>
  );
}
