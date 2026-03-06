import { motion } from 'framer-motion';
import { GraduationCap, ExternalLink } from 'lucide-react';

const PLATFORM_URL = 'https://campus.upe.edu.py:86/moodle/my/courses.php';

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
      <p className="text-sm font-medium text-gray-400 pl-12 mb-4">
        4º Año — Grupo C.1
      </p>
      <motion.a
        href={PLATFORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 ml-12 px-4 py-2.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm font-semibold transition-colors"
      >
        <ExternalLink size={16} strokeWidth={2} />
        Acessar Plataforma
      </motion.a>
    </motion.header>
  );
}
