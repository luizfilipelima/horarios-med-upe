import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTimeRange, GRUPO_TODOS, parseGruposAlvo, serializeGruposAlvo } from '../data/schedule';
import type { ClassItem, ClassType } from '../data/schedule';

const inputClass =
  'w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:border-indigo-300 dark:focus:border-indigo-500/50 focus:outline-none transition-shadow min-h-[48px]';

const sectionLabelClass =
  'block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2';

function getAulaHorarios(aula: ClassItem): { inicio: string; fim: string } {
  if (aula.horarioInicio && aula.horarioFim)
    return { inicio: aula.horarioInicio, fim: aula.horarioFim };
  const parts = (aula.time || '').split(/\s*-\s*/).map((p) => p.trim());
  return { inicio: parts[0] || '08:00', fim: parts[1] || '10:00' };
}

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
  dias_semana: ['lunes'] as string[],
  horarioInicio: '08:00',
  horarioFim: '10:00',
  type: 'teoria' as ClassType,
  location: '',
  gruposAlvo: [GRUPO_TODOS] as string[],
};

export function ManageScheduleModal({ isOpen, onClose }: ManageScheduleModalProps) {
  const { schedule, visibleDays, groups, addAula, updateAulaById, removeAulaById } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set(['lunes']));
  const [duplicating, setDuplicating] = useState<{ aula: ClassItem; sourceDayId: string } | null>(null);
  const [duplicateTargetDays, setDuplicateTargetDays] = useState<Set<string>>(new Set());

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  const startAdd = () => {
    setDuplicating(null);
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const startEdit = (item: ClassItem, dayId: string) => {
    setDuplicating(null);
    setForm({
      subject: item.subject,
      professor: item.professor,
      dias_semana: [dayId],
      horarioInicio: item.horarioInicio ?? '08:00',
      horarioFim: item.horarioFim ?? '10:00',
      type: item.type,
      location: item.location,
      gruposAlvo: parseGruposAlvo(item.grupoAlvo),
    });
    setEditingId(item.id ?? null);
    setEditingDayId(dayId);
    setExpandedDays((prev) => new Set(prev).add(dayId));
    setFormOpen(true);
  };

  const toggleFormDay = (dayId: string) => {
    setForm((prev) => {
      const next = prev.dias_semana.includes(dayId)
        ? prev.dias_semana.filter((d) => d !== dayId)
        : [...prev.dias_semana, dayId];
      return { ...prev, dias_semana: next.length > 0 ? next : prev.dias_semana };
    });
  };

  const toggleFormGrupo = (grupo: string) => {
    setForm((prev) => {
      const hasTodos = prev.gruposAlvo.includes(GRUPO_TODOS);
      const hasGrupo = prev.gruposAlvo.includes(grupo);
      if (grupo === GRUPO_TODOS) {
        return { ...prev, gruposAlvo: hasTodos ? prev.gruposAlvo : [GRUPO_TODOS] };
      }
      if (hasGrupo) {
        const next = prev.gruposAlvo.filter((g) => g !== grupo);
        return { ...prev, gruposAlvo: next.length > 0 ? next : [GRUPO_TODOS] };
      }
      const withoutTodos = prev.gruposAlvo.filter((g) => g !== GRUPO_TODOS);
      return { ...prev, gruposAlvo: [...withoutTodos, grupo] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || form.dias_semana.length === 0) return;

    const baseItem: Omit<ClassItem, 'id'> = {
      subject: form.subject.trim(),
      professor: form.professor.trim(),
      horarioInicio: form.horarioInicio,
      horarioFim: form.horarioFim,
      type: form.type,
      location: form.location.trim(),
      grupoAlvo: serializeGruposAlvo(form.gruposAlvo),
      time: formatTimeRange(form.horarioInicio, form.horarioFim),
    };

    if (editingId) {
      updateAulaById(editingId, { ...baseItem, dia_semana: form.dias_semana[0]! });
      form.dias_semana.slice(1).forEach((dayId) => {
        addAula({ ...baseItem, dia_semana: dayId });
      });
    } else {
      form.dias_semana.forEach((dayId) => {
        addAula({ ...baseItem, dia_semana: dayId });
      });
    }
    setFormOpen(false);
    setForm(emptyForm);
    setEditingId(null);
    setEditingDayId(null);
  };

  const handleRemove = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm('Excluir esta matéria?')) {
      removeAulaById(id);
    }
  };

  const startDuplicate = (aula: ClassItem, sourceDayId: string) => {
    setFormOpen(false);
    setDuplicating({ aula, sourceDayId });
    setDuplicateTargetDays(new Set([sourceDayId]));
    setExpandedDays((prev) => new Set(prev).add(sourceDayId));
  };

  const toggleDuplicateDay = (dayId: string) => {
    setDuplicateTargetDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  const confirmDuplicate = () => {
    if (!duplicating || duplicateTargetDays.size === 0) return;
    const { aula } = duplicating;
    const { inicio, fim } = getAulaHorarios(aula);
    const baseItem: Omit<ClassItem, 'id'> = {
      subject: aula.subject,
      professor: aula.professor,
      horarioInicio: inicio,
      horarioFim: fim,
      type: aula.type,
      location: aula.location,
      grupoAlvo: aula.grupoAlvo || GRUPO_TODOS,
      time: formatTimeRange(inicio, fim),
    };
    duplicateTargetDays.forEach((dayId) => {
      addAula({ ...baseItem, dia_semana: dayId });
    });
    setDuplicating(null);
    setDuplicateTargetDays(new Set());
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
                  {formOpen && !editingId ? (
                    <motion.div
                      key="form-add"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-3xl border-2 border-indigo-200 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-500/5 p-4 sm:p-5"
                    >
                      <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">
                        Nova matéria
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
                          <label className={sectionLabelClass}>Dias da Semana</label>
                          <p className="text-xs text-gray-500 dark:text-zinc-500 mb-2">
                            Selecione um ou mais dias
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {(visibleDays.length > 0 ? visibleDays : schedule.slice(0, 5)).map((d) => {
                              const checked = form.dias_semana.includes(d.id);
                              return (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => toggleFormDay(d.id)}
                                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                                    checked
                                      ? 'bg-indigo-500 text-white'
                                      : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                                  }`}
                                >
                                  {checked && <Check size={16} strokeWidth={2} />}
                                  {d.label}
                                </button>
                              );
                            })}
                          </div>
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
                          <label className={sectionLabelClass}>Grupos vinculados</label>
                          <p className="text-xs text-gray-500 dark:text-zinc-500 mb-2">
                            Selecione &quot;Todos&quot; ou um ou mais grupos específicos
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => toggleFormGrupo(GRUPO_TODOS)}
                              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                                form.gruposAlvo.includes(GRUPO_TODOS)
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                              }`}
                            >
                              {form.gruposAlvo.includes(GRUPO_TODOS) && <Check size={16} strokeWidth={2} />}
                              Todos
                            </button>
                            {groups.map((g) => {
                              const checked = form.gruposAlvo.includes(g);
                              return (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => toggleFormGrupo(g)}
                                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                                    checked
                                      ? 'bg-indigo-500 text-white'
                                      : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                                  }`}
                                >
                                  {checked && <Check size={16} strokeWidth={2} />}
                                  {g}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormOpen(false);
                              setForm(emptyForm);
                              setEditingId(null);
                              setEditingDayId(null);
                            }}
                            className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition-colors"
                          >
                            Adicionar
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
                                    sorted.map((aula) => {
                                      const isDuplicatingThis =
                                        duplicating &&
                                        duplicating.sourceDayId === day.id &&
                                        (duplicating.aula.id ? duplicating.aula.id === aula.id : duplicating.aula.subject === aula.subject && duplicating.aula.time === aula.time);

                                      return (
                                      <div key={aula.id ?? aula.subject + aula.time} className="space-y-2">
                                      {editingId && editingDayId === day.id && aula.id === editingId ? (
                                        <motion.div
                                          key={`edit-${aula.id}`}
                                          layout
                                          initial={{ opacity: 0, y: 4 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, x: -8 }}
                                          className="rounded-xl border-2 border-indigo-200 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-500/5 p-4"
                                        >
                                          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-3">
                                            Editar matéria
                                          </h3>
                                          <form onSubmit={handleSubmit} className="space-y-3">
                                            <input
                                              type="text"
                                              value={form.subject}
                                              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                                              placeholder="Nome da matéria"
                                              className={inputClass}
                                              required
                                            />
                                            <input
                                              type="text"
                                              value={form.professor}
                                              onChange={(e) => setForm((f) => ({ ...f, professor: e.target.value }))}
                                              placeholder="Professor"
                                              className={inputClass}
                                            />
                                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                              {(visibleDays.length > 0 ? visibleDays : schedule.slice(0, 5)).map((d) => {
                                                const checked = form.dias_semana.includes(d.id);
                                                return (
                                                  <button
                                                    key={d.id}
                                                    type="button"
                                                    onClick={() => toggleFormDay(d.id)}
                                                    className={`flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors min-h-[40px] ${
                                                      checked ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                                                    }`}
                                                  >
                                                    {checked && <Check size={14} strokeWidth={2} />}
                                                    {d.shortLabel}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <input
                                                type="time"
                                                value={form.horarioInicio}
                                                onChange={(e) => setForm((f) => ({ ...f, horarioInicio: e.target.value }))}
                                                className={inputClass}
                                              />
                                              <input
                                                type="time"
                                                value={form.horarioFim}
                                                onChange={(e) => setForm((f) => ({ ...f, horarioFim: e.target.value }))}
                                                className={inputClass}
                                              />
                                            </div>
                                            <select
                                              value={form.type}
                                              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ClassType }))}
                                              className={`${inputClass} select-arrow select-arrow-right`}
                                            >
                                              {TIPOS.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                              ))}
                                            </select>
                                            <input
                                              type="text"
                                              value={form.location}
                                              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                                              placeholder="Sala / Local"
                                              className={inputClass}
                                            />
                                            <div>
                                              <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1.5">Grupos</label>
                                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                                                <button
                                                  type="button"
                                                  onClick={() => toggleFormGrupo(GRUPO_TODOS)}
                                                  className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors min-h-[40px] ${
                                                    form.gruposAlvo.includes(GRUPO_TODOS) ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                                                  }`}
                                                >
                                                  {form.gruposAlvo.includes(GRUPO_TODOS) && <Check size={14} strokeWidth={2} />}
                                                  Todos
                                                </button>
                                                {groups.map((g) => {
                                                  const checked = form.gruposAlvo.includes(g);
                                                  return (
                                                    <button
                                                      key={g}
                                                      type="button"
                                                      onClick={() => toggleFormGrupo(g)}
                                                      className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors min-h-[40px] ${
                                                        checked ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300'
                                                      }`}
                                                    >
                                                      {checked && <Check size={14} strokeWidth={2} />}
                                                      {g}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                            <div className="flex gap-2 pt-1">
                                              <button
                                                type="button"
                                                onClick={() => { setFormOpen(false); setForm(emptyForm); setEditingId(null); setEditingDayId(null); }}
                                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-medium text-xs"
                                              >
                                                Cancelar
                                              </button>
                                              <button
                                                type="submit"
                                                className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-xs"
                                              >
                                                Salvar
                                              </button>
                                            </div>
                                          </form>
                                        </motion.div>
                                      ) : (
                                        <motion.div
                                          layout
                                          initial={{ opacity: 0, y: 4 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, x: -8 }}
                                          className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <p className="font-medium text-gray-900 dark:text-zinc-100 truncate">
                                                {aula.subject || '(Sem nome)'}
                                              </p>
                                              {(() => {
                                                const raw = aula.grupoAlvo;
                                                const grupos = (typeof raw === 'string'
                                                  ? parseGruposAlvo(raw)
                                                  : Array.isArray(raw)
                                                    ? (raw as string[]).map((g) => String(g).trim()).filter(Boolean)
                                                    : []
                                                ).filter((g) => g !== GRUPO_TODOS);
                                                if (grupos.length === 0) return null;
                                                return (
                                                  <div className="flex flex-wrap gap-1 shrink-0">
                                                    {grupos.map((g) => (
                                                      <span
                                                        key={g}
                                                        className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
                                                      >
                                                        {g}
                                                      </span>
                                                    ))}
                                                  </div>
                                                );
                                              })()}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-zinc-500">
                                              {aula.time}
                                              {aula.professor && ` · ${aula.professor}`}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => startDuplicate(aula, day.id)}
                                              className="p-2.5 rounded-xl text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                              aria-label="Duplicar"
                                            >
                                              <Copy size={18} strokeWidth={2} />
                                            </button>
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
                                      )}

                                      {/* Card de duplicar — logo abaixo da matéria */}
                                      {isDuplicatingThis && duplicating && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-500/5 p-4"
                                        >
                                          <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-100 mb-1">
                                            Duplicar aula
                                          </h3>
                                          <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3 truncate">
                                            {duplicating.aula.subject || '(Sem nome)'}
                                          </p>
                                          <label className={sectionLabelClass}>Copiar para os dias:</label>
                                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                                            {daysToShow.map((d) => {
                                              const checked = duplicateTargetDays.has(d.id);
                                              return (
                                                <button
                                                  key={d.id}
                                                  type="button"
                                                  onClick={() => toggleDuplicateDay(d.id)}
                                                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                                                    checked
                                                      ? 'bg-indigo-500 text-white'
                                                      : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                                                  }`}
                                                >
                                                  {checked && <Check size={16} strokeWidth={2} />}
                                                  {d.shortLabel}
                                                </button>
                                              );
                                            })}
                                          </div>
                                          <div className="flex gap-2">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setDuplicating(null);
                                                setDuplicateTargetDays(new Set());
                                              }}
                                              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                              Cancelar
                                            </button>
                                            <button
                                              type="button"
                                              onClick={confirmDuplicate}
                                              disabled={duplicateTargetDays.size === 0}
                                              className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                            >
                                              <Copy size={16} strokeWidth={2} />
                                              Duplicar {duplicateTargetDays.size > 0 ? `(${duplicateTargetDays.size})` : ''}
                                            </button>
                                          </div>
                                        </motion.div>
                                      )}
                                    </div>
                                    );
                                    })
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
