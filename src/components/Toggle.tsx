import { motion } from 'framer-motion';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative w-12 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:ring-offset-2 dark:focus:ring-offset-zinc-900
          ${checked ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-zinc-700'}
        `}
      >
        <motion.span
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
          initial={false}
          animate={{ left: checked ? 24 : 4 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      </button>
    </label>
  );
}
