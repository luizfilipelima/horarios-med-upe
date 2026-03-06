import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="px-5 pt-12 pb-6"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200">
          <GraduationCap size={18} className="text-white" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Horários Medicina
        </h1>
      </div>
      <p className="text-sm font-medium text-gray-400 pl-12">
        4º Año — Grupo C.1
      </p>
    </motion.header>
  );
}
