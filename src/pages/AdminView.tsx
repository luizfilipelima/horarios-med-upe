import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGodMode } from '../context/GodModeContext';
import { supabaseClient } from '../lib/supabase';
import { ThemeToggle } from '../components/ThemeToggle';

interface Turma {
  id: string;
  nome: string;
  faculdade: string;
  slug_url: string;
  created_at: string;
}

interface KPI {
  turmas: number;
  delegados: number;
  aulas: number;
  eventos: number;
}

const inputClass =
  'w-full rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/40 focus:outline-none transition-shadow';

export function AdminView() {
  const { signOut } = useAuth();
  const { enterGodMode } = useGodMode();
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [kpi, setKpi] = useState<KPI>({ turmas: 0, delegados: 0, aulas: 0, eventos: 0 });
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addNome, setAddNome] = useState('');
  const [addFaculdade, setAddFaculdade] = useState('');
  const [addSlug, setAddSlug] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [turmasRes, perfisRes, aulasRes, eventosRes] = await Promise.all([
      supabaseClient.from('turmas').select('id, nome, faculdade, slug_url, created_at').order('created_at', { ascending: false }),
      supabaseClient.from('perfis').select('id, role').eq('role', 'delegado'),
      supabaseClient.from('aulas').select('id', { count: 'exact', head: true }),
      supabaseClient.from('eventos').select('id', { count: 'exact', head: true }),
    ]);
    setTurmas((turmasRes.data as Turma[]) ?? []);
    setKpi({
      turmas: (turmasRes.data?.length ?? 0),
      delegados: (perfisRes.data?.length ?? 0),
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
    if (!errTurma) {
      setAddModalOpen(false);
      setAddNome('');
      setAddFaculdade('');
      setAddSlug('');
      loadData();
    }
  };

  const handleModoDeus = (turmaId: string) => {
    enterGodMode(turmaId);
    navigate('/delegado');
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] dark:bg-zinc-950 transition-colors duration-300 max-w-4xl mx-auto px-5">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-12 pb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950">
            <BarChart3 size={18} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
              Gradly — Painel do CEO
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-500">Business Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/login"
            onClick={() => signOut()}
            className="p-2 rounded-2xl bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label="Sair"
          >
            <LogOut size={20} strokeWidth={2} />
          </Link>
        </div>
      </motion.header>

      {/* KPIs */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
      >
        {[
          { label: 'Total de Turmas', value: kpi.turmas, icon: BarChart3 },
          { label: 'Total de Delegados', value: kpi.delegados, icon: Users },
          { label: 'Total de Aulas', value: kpi.aulas, icon: BookOpen },
          { label: 'Total de Eventos', value: kpi.eventos, icon: Calendar },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <item.icon size={18} className="text-indigo-500 dark:text-indigo-400" strokeWidth={2} />
              <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                {item.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
              {loading ? '—' : item.value}
            </p>
          </motion.div>
        ))}
      </motion.section>

      {/* Lista de Turmas */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Turmas</h2>
          <motion.button
            type="button"
            onClick={() => setAddModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-200 dark:shadow-indigo-950 hover:bg-indigo-600 transition-colors"
          >
            <Plus size={18} strokeWidth={2} />
            Adicionar Nova Turma
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="text-indigo-500 animate-spin" strokeWidth={2} />
          </div>
        ) : turmas.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700 py-12 text-center text-gray-500 dark:text-zinc-500">
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
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-zinc-100 truncate">{t.nome}</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">
                    {t.faculdade} · <span className="font-mono">{t.slug_url}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    aria-label="Editar Turma"
                    title="Editar Turma"
                  >
                    <Pencil size={18} strokeWidth={2} />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    aria-label="Criar Delegado"
                    title="Criar Delegado"
                  >
                    <UserPlus size={18} strokeWidth={2} />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => handleModoDeus(t.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                  >
                    <Eye size={18} strokeWidth={2} />
                    Modo Deus
                  </motion.button>
                  <a
                    href={`/t/${t.slug_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    /t/{t.slug_url}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Modal Adicionar Turma */}
      <AnimatePresence>
        {addModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
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
                className="pointer-events-auto w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 shadow-xl dark:border dark:border-zinc-800 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                    Nova Turma
                  </h3>
                </div>
                <form onSubmit={handleAddTurma} className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                      Nome
                    </label>
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
                    <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                      Faculdade
                    </label>
                    <input
                      type="text"
                      value={addFaculdade}
                      onChange={(e) => setAddFaculdade(e.target.value)}
                      placeholder="Ex: UPE"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={addSlug}
                      onChange={(e) => setAddSlug(e.target.value)}
                      placeholder="Ex: med-4c1"
                      className={inputClass}
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                      URL da turma: /t/{addSlug.trim() || 'slug'}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <motion.button
                      type="button"
                      onClick={() => setAddModalOpen(false)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-semibold text-sm"
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
                      {addSaving ? (
                        <Loader2 size={18} className="animate-spin" strokeWidth={2} />
                      ) : (
                        'Criar'
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
