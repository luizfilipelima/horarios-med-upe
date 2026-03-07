import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DAYS_ORDER, formatTimeRange } from '../data/schedule';
import type { ClassItem, ClassType } from '../data/schedule';

const inputClass =
  'w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:outline-none transition-shadow min-h-[48px]';

const sectionLabelClass =
  'block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2';

const DIAS_OPCOES = DAYS_ORDER.map((d) => ({ value: d.id, label: d.label }));

const TIPOS: { value: ClassType; label: string }[] = [
  { value: 'teoria', label: 'Teoria' },
  { value: 'practica', label: 'Práctica' },
  { value: 'simulacion', label: 'Simulación' },
  { value: 'virtual', label: 'Virtual' },
];

interface ManageScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emptyForm = {
  subject: '',
  professor: '',
  dia_semana: 'lunes',
  horarioInicio: '08:00',
  horarioFim: '10:00',
  type: 'teoria' as ClassType,
  location: '',
  grupoAlvo: 'Todos',
};

export function ManageScheduleModal({ isOpen, onClose }: ManageScheduleModalProps) {
  const { schedule, visibleDays, addAula, updateAulaById, removeAulaById } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set(['lunes']));

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  const startAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const startEdit = (item: ClassItem, dayId: string) => {
    setForm({
      subject: item.subject,
      professor: item.professor,
      dia_semana: dayId,
      horarioInicio: item.horarioInicio ?? '08:00',
      horarioFim: item.horarioFim ?? '10:00',
      type: item.type,
      location: item.location,
      grupoAlvo: item.grupoAlvo || 'Todos',
    });
    setEditingId(item.id ?? null);
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) return;

    const classItem: Omit<ClassItem, 'id'> & { dia_semana: string } = {
      subject: form.subject.trim(),
      professor: form.professor.trim(),
      dia_semana: form.dia_semana,
      horarioInicio: form.horarioInicio,
      horarioFim: form.horarioFim,
      type: form.type,
      location: form.location.trim(),
      grupoAlvo: form.grupoAlvo || 'Todos',
      time: formatTimeRange(form.horarioInicio, form.horarioFim),
    };

    if (editingId) {
      updateAulaById(editingId, classItem);
    } else {
      addAula(classItem);
    }
    setFormOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleRemove = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm('Excluir esta matéria?')) {
      removeAulaById(id);
    }
  };

  const daysToShow = visibleDays.length > 0 ? visibleDays : schedule.slice(0, 5);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-lg max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 shadow-xl dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden"
            >
              <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  Gerenciar Horários
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                  aria-label="Fechar"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                <motion.button
                  type="button"
                  onClick={startAdd}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-indigo-950 hover:bg-indigo-600 transition-colors min-h-[52px]"
                >
                  <Plus size={20} strokeWidth={2} />
                  Adicionar Nova Matéria
                </motion.button>

                <AnimatePresence mode="wait">
                  {formOpen ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-3xl border-2 border-indigo-200 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-500/5 p-4 sm:p-5"
                    >
                      <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">
                        {editingId ? 'Editar matéria' : 'Nova matéria'}
                      </h3>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className={sectionLabelClass}>Nome da Matéria</label>
                          <input
                            type="text"
                            value={form.subject}
                            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                            placeholder="Ex: Ginecología y Obstetrícia"
                            className={inputClass}
                            required
                          />
                        </div>
                        <div>
                          <label className={sectionLabelClass}>Professor</label>
                          <input
                            type="text"
                            value={form.professor}
                            onChange={(e) => setForm((f) => ({ ...f, professor: e.target.value }))}
                            placeholder="Ex: Dr. João Silva"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={sectionLabelClass}>Dia da Semana</label>
                          <select
                            value={form.dia_semana}
                            onChange={(e) => setForm((f) => ({ ...f, dia_semana: e.target.value }))}
                            className={`${inputClass} select-arrow select-arrow-right`}
                          >
                            {DIAS_OPCOES.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={sectionLabelClass}>Início</label>
                            <input
                              type="time"
                              value={form.horarioInicio}
                              onChange={(e) => setForm((f) => ({ ...f, horarioInicio: e.target.value }))}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={sectionLabelClass}>Fim</label>
                            <input
                              type="time"
                              value={form.horarioFim}
                              onChange={(e) => setForm((f) => ({ ...f, horarioFim: e.target.value }))}
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={sectionLabelClass}>Tipo da Aula</label>
                          <select
                            value={form.type}
                            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ClassType }))}
                            className={`${inputClass} select-arrow select-arrow-right`}
                          >
                            {TIPOS.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={sectionLabelClass}>Sala / Local</label>
                          <input
                            type="text"
                            value={form.location}
                            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                            placeholder="Ex: Sala 27, Bloque B"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={sectionLabelClass}>Grupo (opcional)</label>
                          <input
                            type="text"
                            value={form.grupoAlvo === 'Todos' ? '' : form.grupoAlvo}
                            onChange={(e) => setForm((f) => ({ ...f, grupoAlvo: e.target.value || 'Todos' }))}
                            placeholder="Ex: Grupo C.1"
                            className={inputClass}
                          />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormOpen(false);
                              setForm(emptyForm);
                              setEditingId(null);
                            }}
                            className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition-colors"
                          >
                            {editingId ? 'Salvar' : 'Adicionar'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <section>
                  <label className={sectionLabelClass}>Matérias por dia</label>
                  <div className="space-y-2">
                    {daysToShow.map((day) => {
                      const aulas = schedule.find((d) => d.id === day.id)?.classes ?? [];
                      const sorted = [...aulas].sort((a, b) =>
                        (a.horarioInicio ?? '00:00').localeCompare(b.horarioInicio ?? '00:00')
                      );
                      const isExpanded = expandedDays.has(day.id);

                      return (
                        <div
                          key={day.id}
                          className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/30 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-gray-900 dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800/60 transition-colors"
                          >
                            <span>{day.label}</span>
                            <span className="flex items-center gap-2">
                              <span className="text-xs font-normal text-gray-500 dark:text-zinc-500">
                                {sorted.length} {sorted.length === 1 ? 'aula' : 'aulas'}
                              </span>
                              {isExpanded ? (
                                <ChevronUp size={18} className="text-gray-500" />
                              ) : (
                                <ChevronDown size={18} className="text-gray-500" />
                              )}
                            </span>
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-gray-200 dark:border-zinc-700 overflow-hidden"
                              >
                                <div className="p-2 space-y-2">
                                  {sorted.length === 0 ? (
                                    <p className="px-3 py-4 text-sm text-gray-500 dark:text-zinc-500 text-center">
                                      Nenhuma aula neste dia
                                    </p>
                                  ) : (
                                    sorted.map((aula) => (
                                      <motion.div
                                        key={aula.id ?? aula.subject + aula.time}
                                        layout
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -8 }}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-gray-900 dark:text-zinc-100 truncate">
                                            {aula.subject || '(Sem nome)'}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-zinc-500">
                                            {aula.time}
                                            {aula.professor && ` · ${aula.professor}`}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => startEdit(aula, day.id)}
                                            className="p-2.5 rounded-xl text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                            aria-label="Editar"
                                          >
                                            <Pencil size={18} strokeWidth={2} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => aula.id && handleRemove(aula.id)}
                                            className="p-2.5 rounded-xl text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                            aria-label="Excluir"
                                          >
                                            <Trash2 size={18} strokeWidth={2} />
                                          </button>
                                        </div>
                                      </motion.div>
                                    ))
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-sm hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors"
                >
                  Concluído
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
