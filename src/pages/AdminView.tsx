import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  BookOpen,
  Calendar,
  Plus,
  Pencil,
  UserPlus,
  Eye,
  LogOut,
  Loader2,
  Link2,
  Check,
  MoreVertical,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGodMode } from '../context/GodModeContext';
import { supabaseClient } from '../lib/supabase';
import { ThemeToggle } from '../components/ThemeToggle';
import { Footer } from '../components/Footer';
import { EditTurmaModal } from '../components/EditTurmaModal';
import { GerenciarDelegadosModal } from '../components/GerenciarDelegadosModal';
import { SolicitacoesPendentesSection } from '../components/SolicitacoesPendentesSection';

interface Turma {
  id: string;
  nome: string;
  faculdade: string;
  slug_url: string;
  created_at: string;
  ativa?: boolean;
}

interface KPI {
  turmas: number;
  delegados: number;
  alunos: number;
  aulas: number;
  eventos: number;
}

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-white/5 dark:border-zinc-700 dark:bg-zinc-900 px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition-shadow';

export function AdminView() {
  const { signOut } = useAuth();
  const { enterGodMode } = useGodMode();
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [kpi, setKpi] = useState<KPI>({ turmas: 0, delegados: 0, alunos: 0, aulas: 0, eventos: 0 });
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addNome, setAddNome] = useState('');
  const [addFaculdade, setAddFaculdade] = useState('');
  const [addSlug, setAddSlug] = useState('');
  const [addSaving, setAddSaving] = useState(false);
  const [inviteCopiedId, setInviteCopiedId] = useState<string | null>(null);
  const [editModalTurma, setEditModalTurma] = useState<Turma | null>(null);
  const [delegadosModalTurma, setDelegadosModalTurma] = useState<Turma | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [alunosByTurmaId, setAlunosByTurmaId] = useState<Record<string, number>>({});
  const [toastCopied, setToastCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [tituloByTurmaId, setTituloByTurmaId] = useState<Record<string, string>>({});

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [
      turmasRes,
      configsRes,
      perfisRes,
      aulasRes,
      eventosRes,
      convitesRes,
      convitesByTurmaRes,
    ] = await Promise.all([
      supabaseClient.from('turmas').select('id, nome, faculdade, slug_url, created_at').order('created_at', { ascending: false }),
      supabaseClient.from('configuracoes').select('turma_id, titulo'),
      supabaseClient.from('perfis').select('id, role, status').eq('role', 'delegado'),
      supabaseClient.from('aulas').select('id', { count: 'exact', head: true }),
      supabaseClient.from('eventos').select('id', { count: 'exact', head: true }),
      supabaseClient.from('convites').select('id', { count: 'exact', head: true }).eq('usado', true),
      supabaseClient
        .from('convites')
        .select('turma_id')
        .eq('usado', true),
    ]);
    const turmasData = (turmasRes.data ?? []) as Turma[];
    setTurmas(turmasData);
    const tituloMap: Record<string, string> = {};
    if (configsRes.data && Array.isArray(configsRes.data)) {
      for (const row of configsRes.data as Array<{ turma_id: string; titulo: string | null }>) {
        if (row.turma_id && row.titulo != null) tituloMap[row.turma_id] = row.titulo;
      }
    }
    setTituloByTurmaId(tituloMap);
    const delegadosAprovados = (perfisRes.data ?? []).filter(
      (p: { status?: string }) => p.status !== 'pendente' && p.status !== 'rejeitado'
    ).length;
    const alunosMap: Record<string, number> = {};
    if (convitesByTurmaRes.data && Array.isArray(convitesByTurmaRes.data)) {
      for (const row of convitesByTurmaRes.data as Array<{ turma_id: string }>) {
        if (row.turma_id) alunosMap[row.turma_id] = (alunosMap[row.turma_id] ?? 0) + 1;
      }
    }
    setAlunosByTurmaId(alunosMap);
    setKpi({
      turmas: turmasData.length,
      delegados: delegadosAprovados,
      alunos: convitesRes.count ?? 0,
      aulas: aulasRes.count ?? 0,
      eventos: eventosRes.count ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    const nome = addNome.trim();
    const faculdade = addFaculdade.trim();
    const slug = addSlug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!nome || !slug) return;
    setAddSaving(true);
    const { data: newTurma, error: errTurma } = await supabaseClient
      .from('turmas')
      .insert({ nome, faculdade, slug_url: slug })
      .select('id')
      .single();
    if (errTurma || !newTurma) {
      setAddSaving(false);
      return;
    }
    await supabaseClient.from('configuracoes').insert({
      turma_id: newTurma.id,
      titulo: nome,
      subtitulo: '',
      link_drive: 'https://drive.google.com',
      link_plataforma: 'https://campus.upe.edu.py:86/moodle/my/courses.php',
      ativar_sabado: false,
      ativar_domingo: false,
      array_de_grupos: ['Grupo 1'],
    });
    setAddSaving(false);
    setAddModalOpen(false);
    setAddNome('');
    setAddFaculdade('');
    setAddSlug('');
    loadData();
  };

  const handleModoDeus = (turmaId: string) => {
    setOpenDropdownId(null);
    enterGodMode(turmaId);
    navigate('/delegado');
  };

  const handleGerarConvite = async (turmaId: string) => {
    const { data, error } = await supabaseClient
      .from('convites')
      .insert({ turma_id: turmaId })
      .select('token')
      .single();
    if (error || !data?.token) return;
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/convite/${data.token}`;
    try {
      await navigator.clipboard.writeText(url);
      setInviteCopiedId(turmaId);
      setToastCopied(true);
      setTimeout(() => {
        setInviteCopiedId(null);
        setToastCopied(false);
      }, 2500);
    } catch {
      setInviteCopiedId(null);
    }
  };

  const kpiItems = [
    { label: 'Turmas', value: kpi.turmas, icon: BarChart3 },
    { label: 'Delegados', value: kpi.delegados, icon: Users },
    { label: 'Alunos Ativos', value: kpi.alunos, icon: Users },
    { label: 'Aulas', value: kpi.aulas, icon: BookOpen },
    { label: 'Eventos', value: kpi.eventos, icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-slate-950 text-gray-900 dark:text-slate-50 antialiased transition-colors duration-300">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 backdrop-blur-xl bg-[#f8f7f5]/90 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <BarChart3 size={20} className="text-indigo-400" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Gradly — Painel CEO</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Business Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/login"
            onClick={() => signOut()}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-500/30 transition-colors"
            aria-label="Sair"
          >
            <LogOut size={20} strokeWidth={2} />
          </Link>
        </div>
      </motion.header>

      {/* Toast Copiado */}
        <AnimatePresence>
          {toastCopied && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/90 backdrop-blur-md border border-emerald-400/30 shadow-lg"
            >
              <Check size={20} className="text-white" strokeWidth={2} />
              <span className="text-sm font-medium text-white">Link copiado para a área de transferência</span>
            </motion.div>
          )}
        </AnimatePresence>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* BI Grid */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {kpiItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className="rounded-2xl bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 sm:p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <item.icon size={18} className="text-indigo-400 shrink-0" strokeWidth={2} />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider truncate">
                  {item.label}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {loading ? '—' : item.value}
              </p>
            </motion.div>
          ))}
        </motion.section>

        <SolicitacoesPendentesSection onSuccess={loadData} />

        {/* Lista de Turmas */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Turmas</h2>
            <motion.button
              type="button"
              onClick={() => setAddModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-colors"
            >
              <Plus size={18} strokeWidth={2} />
              Nova Turma
            </motion.button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={32} className="text-indigo-500 animate-spin" strokeWidth={2} />
            </div>
          ) : turmas.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 py-16 text-center text-slate-500 dark:text-slate-400">
              Nenhuma turma cadastrada.
            </div>
          ) : (
            <div className="space-y-3">
              {turmas.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${openDropdownId === t.id ? 'relative z-50' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {tituloByTurmaId[t.id] ?? t.nome}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                      <span>{t.faculdade || '—'}</span>
                      <span className="font-mono text-indigo-400">/t/{t.slug_url}</span>
                      <span>· {alunosByTurmaId[t.id] ?? 0} alunos</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Botão Copiar Convite - 44x44 min touch target */}
                    <motion.button
                      type="button"
                      onClick={() => handleGerarConvite(t.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl font-medium text-sm transition-colors ${
                        inviteCopiedId === t.id
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-indigo-500/30'
                      }`}
                      aria-label={inviteCopiedId === t.id ? 'Link copiado!' : 'Copiar link de convite'}
                      title={inviteCopiedId === t.id ? 'Copiado!' : 'Gerar e copiar link de convite'}
                    >
                      {inviteCopiedId === t.id ? (
                        <Check size={20} strokeWidth={2} />
                      ) : (
                        <Link2 size={20} strokeWidth={2} />
                      )}
                    </motion.button>

                    {/* Menu Dropdown - Ações */}
                    <div className="relative" ref={openDropdownId === t.id ? dropdownRef : undefined}>
                      <motion.button
                        type="button"
                        onClick={() => setOpenDropdownId(openDropdownId === t.id ? null : t.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors"
                        aria-label="Mais opções"
                      >
                        <MoreVertical size={20} strokeWidth={2} />
                      </motion.button>

                      <AnimatePresence>
                        {openDropdownId === t.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute right-0 top-full mt-2 py-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl z-50"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditModalTurma(t);
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                            >
                              <Pencil size={16} strokeWidth={2} />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDelegadosModalTurma(t);
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                            >
                              <UserPlus size={16} strokeWidth={2} />
                              Gerenciar Delegados
                            </button>
                            <button
                              type="button"
                              onClick={() => handleModoDeus(t.id)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-indigo-400 hover:bg-indigo-500/10"
                            >
                              <Eye size={16} strokeWidth={2} />
                              Modo Deus
                            </button>
                            <a
                              href={`/t/${t.slug_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                            >
                              <Link2 size={16} strokeWidth={2} />
                              Abrir turma
                            </a>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </main>

      {/* Modal Adicionar Turma */}
      <AnimatePresence>
        {addModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setAddModalOpen(false)}
              aria-hidden
            />
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white">Nova Turma</h3>
                </div>
                <form onSubmit={handleAddTurma} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nome</label>
                    <input
                      type="text"
                      value={addNome}
                      onChange={(e) => setAddNome(e.target.value)}
                      placeholder="Ex: Medicina 4º ano"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Faculdade</label>
                    <input
                      type="text"
                      value={addFaculdade}
                      onChange={(e) => setAddFaculdade(e.target.value)}
                      placeholder="Ex: UPE"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Slug (URL)</label>
                    <input
                      type="text"
                      value={addSlug}
                      onChange={(e) => setAddSlug(e.target.value)}
                      placeholder="Ex: med-4c1"
                      className={inputClass}
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">/t/{addSlug.trim() || 'slug'}</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      type="button"
                      onClick={() => setAddModalOpen(false)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/10"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={addSaving}
                      whileHover={!addSaving ? { scale: 1.01 } : undefined}
                      whileTap={!addSaving ? { scale: 0.99 } : undefined}
                      className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white font-semibold text-sm disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {addSaving ? <Loader2 size={18} className="animate-spin" strokeWidth={2} /> : 'Criar'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <EditTurmaModal turma={editModalTurma} isOpen={editModalTurma !== null} onClose={() => setEditModalTurma(null)} onSuccess={loadData} />
      <GerenciarDelegadosModal turma={delegadosModalTurma} isOpen={delegadosModalTurma !== null} onClose={() => setDelegadosModalTurma(null)} onSuccess={loadData} />

      <Footer />
    </div>
  );
}
