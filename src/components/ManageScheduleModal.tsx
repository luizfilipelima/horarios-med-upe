import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Copy, Check, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTimeRange, GRUPO_TODOS, parseGruposAlvo, serializeGruposAlvo } from '../data/schedule';
import type { ClassItem, ClassType } from '../data/schedule';
import { Toggle } from './Toggle';

const SECTION_LABEL_CLASS = 'label-premium';

const TOUCH_TARGET = 'min-h-[44px] min-w-[44px] flex items-center justify-center';

type ViewState = 'list' | 'form';

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
  const [viewState, setViewState] = useState<ViewState>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set(['lunes']));
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'duplicate'>('add');
  const [grupoInputValue, setGrupoInputValue] = useState('');

  const daysToShow = visibleDays.length > 0 ? visibleDays : schedule.slice(0, 5);

  const goToList = useCallback(() => {
    setViewState('list');
    setForm(emptyForm);
    setEditingId(null);
    setFormMode('add');
    setGrupoInputValue('');
  }, []);

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
    setFormMode('add');
    setGrupoInputValue('');
    setViewState('form');
  };

  const startEdit = (item: ClassItem, dayId: string) => {
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
    setFormMode('edit');
    setGrupoInputValue('');
    setViewState('form');
  };

  const startDuplicate = (aula: ClassItem, sourceDayId: string) => {
    const { inicio, fim } = getAulaHorarios(aula);
    setForm({
      subject: aula.subject,
      professor: aula.professor,
      dias_semana: [sourceDayId],
      horarioInicio: inicio,
      horarioFim: fim,
      type: aula.type,
      location: aula.location,
      gruposAlvo: parseGruposAlvo(aula.grupoAlvo),
    });
    setEditingId(null);
    setFormMode('duplicate');
    setGrupoInputValue('');
    setViewState('form');
  };

  const toggleFormDay = (dayId: string) => {
    setForm((prev) => {
      const next = prev.dias_semana.includes(dayId)
        ? prev.dias_semana.filter((d) => d !== dayId)
        : [...prev.dias_semana, dayId];
      return { ...prev, dias_semana: next.length > 0 ? next : prev.dias_semana };
    });
  };

  const turmaInteira = form.gruposAlvo.includes(GRUPO_TODOS);

  const setTurmaInteira = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      gruposAlvo: checked ? [GRUPO_TODOS] : [],
    }));
  };

  const addGrupo = (grupo: string) => {
    const g = grupo.trim();
    if (!g || form.gruposAlvo.includes(g)) return;
    setForm((prev) => ({
      ...prev,
      gruposAlvo: prev.gruposAlvo.filter((x) => x !== GRUPO_TODOS).concat(g),
    }));
    setGrupoInputValue('');
  };

  const removeGrupo = (grupo: string) => {
    setForm((prev) => {
      const next = prev.gruposAlvo.filter((g) => g !== grupo);
      return { ...prev, gruposAlvo: next.length > 0 ? next : [GRUPO_TODOS] };
    });
  };

  const handleGrupoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = e.key === ',' ? grupoInputValue : (e.target as HTMLInputElement).value;
      if (val.trim()) addGrupo(val.trim());
    }
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

    if (editingId && formMode === 'edit') {
      updateAulaById(editingId, { ...baseItem, dia_semana: form.dias_semana[0]! });
      form.dias_semana.slice(1).forEach((dayId) => {
        addAula({ ...baseItem, dia_semana: dayId });
      });
    } else {
      form.dias_semana.forEach((dayId) => {
        addAula({ ...baseItem, dia_semana: dayId });
      });
    }
    goToList();
  };

  const handleRemove = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm('Excluir esta matéria?')) {
      removeAulaById(id);
    }
  };

  const formTitle =
    formMode === 'edit' ? 'Editar Matéria' : formMode === 'duplicate' ? 'Duplicar Matéria' : 'Nova Matéria';

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
              className="pointer-events-auto w-full max-w-lg max-h-[90vh] sm:max-h-[88vh] flex flex-col rounded-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 shadow-xl dark:shadow-none dark:border dark:border-zinc-800 overflow-hidden"
            >
              {/* Header: muda conforme view */}
              <div className="flex-shrink-0 flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-zinc-800">
                {viewState === 'form' ? (
                  <button
                    type="button"
                    onClick={goToList}
                    className={`p-2.5 rounded-full text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors ${TOUCH_TARGET}`}
                    aria-label="Voltar"
                  >
                    <ArrowLeft size={22} strokeWidth={2} />
                  </button>
                ) : null}
                <h2 className="flex-1 text-lg font-bold text-gray-900 dark:text-zinc-100">
                  {viewState === 'form' ? formTitle : 'Gerenciar Horários'}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className={`p-2.5 rounded-full text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors ${TOUCH_TARGET}`}
                  aria-label="Fechar"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              {/* Conteúdo: LIST_VIEW ou FORM_VIEW */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <AnimatePresence mode="wait">
                  {viewState === 'list' ? (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="flex-1 overflow-y-auto px-5 py-5 space-y-4 flex flex-col"
                    >
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

                      <section>
                        <label className={SECTION_LABEL_CLASS}>Matérias por dia</label>
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
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <p className="font-medium text-gray-900 dark:text-zinc-100 truncate">
                                                    {aula.subject || '(Sem nome)'}
                                                  </p>
                                                  {(() => {
                                                    const raw = aula.grupoAlvo;
                                                    const grupos = (
                                                      typeof raw === 'string'
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
                                                  className={`p-2.5 rounded-xl text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors ${TOUCH_TARGET}`}
                                                  aria-label="Duplicar"
                                                >
                                                  <Copy size={18} strokeWidth={2} />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => startEdit(aula, day.id)}
                                                  className={`p-2.5 rounded-xl text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors ${TOUCH_TARGET}`}
                                                  aria-label="Editar"
                                                >
                                                  <Pencil size={18} strokeWidth={2} />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => aula.id && handleRemove(aula.id)}
                                                  className={`p-2.5 rounded-xl text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ${TOUCH_TARGET}`}
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
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, x: 32 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 32 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="flex-1 overflow-y-auto flex flex-col min-h-0"
                    >
                      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                        <div className="flex-1 px-5 py-5 space-y-6 overflow-y-auto">
                          {/* Bloco 1: O Quê e Quem */}
                          <section className="space-y-4">
                            <label className={SECTION_LABEL_CLASS}>O quê e quem</label>
                            <input
                              type="text"
                              value={form.subject}
                              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                              placeholder="Nome da Matéria"
                              className="input-premium"
                              required
                            />
                            <input
                              type="text"
                              value={form.professor}
                              onChange={(e) => setForm((f) => ({ ...f, professor: e.target.value }))}
                              placeholder="Professor"
                              className="input-premium"
                            />
                          </section>

                          {/* Bloco 2: Quando e Onde */}
                          <section className="space-y-4">
                            <label className={SECTION_LABEL_CLASS}>Quando e onde</label>
                            <div className="flex flex-wrap gap-2">
                              {daysToShow.map((d) => {
                                const checked = form.dias_semana.includes(d.id);
                                return (
                                  <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => toggleFormDay(d.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors min-h-[40px] ${
                                      checked
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                                    }`}
                                  >
                                    {checked && <Check size={14} strokeWidth={2} />}
                                    {d.shortLabel}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="sr-only">Início</label>
                                <input
                                  type="time"
                                  value={form.horarioInicio}
                                  onChange={(e) => setForm((f) => ({ ...f, horarioInicio: e.target.value }))}
                                  className="input-premium"
                                />
                              </div>
                              <div>
                                <label className="sr-only">Fim</label>
                                <input
                                  type="time"
                                  value={form.horarioFim}
                                  onChange={(e) => setForm((f) => ({ ...f, horarioFim: e.target.value }))}
                                  className="input-premium"
                                />
                              </div>
                            </div>
                            <input
                              type="text"
                              value={form.location}
                              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                              placeholder="Sala / Local"
                              className="input-premium"
                            />
                          </section>

                          {/* Bloco 3: Modalidade e Público */}
                          <section className="space-y-4">
                            <label className={SECTION_LABEL_CLASS}>Modalidade e público</label>
                            <select
                              value={form.type}
                              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ClassType }))}
                              className="input-premium select-arrow select-arrow-right"
                            >
                              {TIPOS.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>

                            <div className="space-y-3">
                              <div className="min-h-[44px] flex items-center">
                                <Toggle
                                  label="Aula para a turma inteira"
                                  checked={turmaInteira}
                                  onChange={setTurmaInteira}
                                />
                              </div>
                              {!turmaInteira && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-2"
                                >
                                  <div className="flex flex-wrap gap-2 min-h-[48px] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                                    {form.gruposAlvo.map((g) => (
                                      <span
                                        key={g}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium"
                                      >
                                        {g}
                                        <button
                                          type="button"
                                          onClick={() => removeGrupo(g)}
                                          className={`p-0.5 rounded hover:bg-indigo-200 dark:hover:bg-indigo-500/40 transition-colors ${TOUCH_TARGET}`}
                                          aria-label={`Remover ${g}`}
                                        >
                                          <X size={14} strokeWidth={2} />
                                        </button>
                                      </span>
                                    ))}
                                    <input
                                      type="text"
                                      value={grupoInputValue}
                                      onChange={(e) => setGrupoInputValue(e.target.value)}
                                      onKeyDown={handleGrupoKeyDown}
                                      onBlur={() => grupoInputValue.trim() && addGrupo(grupoInputValue.trim())}
                                      placeholder="Digite (ex: C.1) ou escolha abaixo"
                                      className="flex-1 min-w-[120px] bg-transparent text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {groups.map((g) => {
                                      if (form.gruposAlvo.includes(g)) return null;
                                      return (
                                        <button
                                          key={g}
                                          type="button"
                                          onClick={() => addGrupo(g)}
                                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
                                        >
                                          + {g}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </section>
                        </div>

                        {/* Rodapé fixo com botões */}
                        <div className="flex-shrink-0 sticky bottom-0 px-5 py-4 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={goToList}
                              className="flex-1 h-12 rounded-2xl bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 font-medium text-sm border border-slate-200 dark:border-white/10 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="flex-1 h-12 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition-colors"
                            >
                              {formMode === 'edit' ? 'Salvar' : formMode === 'duplicate' ? 'Duplicar' : 'Adicionar'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {viewState === 'list' && (
                <div className="flex-shrink-0 px-5 py-4 border-t border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center h-12 px-4 rounded-2xl bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-sm hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors"
                  >
                    Concluído
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
