import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Check, X, Eye, EyeOff } from 'lucide-react';
import { supabaseClient } from '../lib/supabase';
import { sendPendingEmail } from '../utils/emailService';
import { useDebounce } from '../hooks/useDebounce';
import { getPasswordStrength, formatWhatsApp, whatsappToWaMe, normalizeSlug, type PaisCodigo } from '../utils/validators';

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3.5 text-sm text-slate-50 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:outline-none transition-all';

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [paisWhatsapp, setPaisWhatsapp] = useState<PaisCodigo>('br');
  const [whatsapp, setWhatsapp] = useState('');
  const [nomeTurma, setNomeTurma] = useState('');
  const [slugDesejado, setSlugDesejado] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSlug = useDebounce(normalizeSlug(slugDesejado), 400);

  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 2) {
      setSlugAvailable(null);
      return;
    }
    setSlugChecking(true);
    try {
      const { data } = await supabaseClient
        .from('turmas')
        .select('id')
        .eq('slug_url', slug)
        .maybeSingle();
      setSlugAvailable(!data);
    } catch {
      setSlugAvailable(null);
    } finally {
      setSlugChecking(false);
    }
  }, []);

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatWhatsApp(e.target.value, paisWhatsapp));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugDesejado(e.target.value);
  };

  useEffect(() => {
    if (debouncedSlug.length >= 2) checkSlugAvailability(debouncedSlug);
    else setSlugAvailable(null);
  }, [debouncedSlug, checkSlugAvailability]);

  const pwStrength = getPasswordStrength(password);
  const slugNorm = normalizeSlug(slugDesejado);
  const whatsappDigits = whatsapp.replace(/\D/g, '');
  const canSubmitStep1 = nome.trim().length >= 3 && email.trim().length >= 5 && password.length >= 6;
  const canSubmitStep2 =
    (paisWhatsapp === 'br' ? whatsappDigits.length >= 11 : whatsappDigits.length >= 9) &&
    nomeTurma.trim().length >= 3 &&
    slugNorm.length >= 2 &&
    slugAvailable === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step !== 2 || !canSubmitStep1 || !canSubmitStep2) return;
    setIsSubmitting(true);
    try {
      const { error: err } = await supabaseClient.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            onboarding: true,
            nome_completo: nome.trim(),
            whatsapp: '+' + whatsappToWaMe(whatsapp.trim(), paisWhatsapp),
            nome_turma: nomeTurma.trim(),
            slug_desejado: slugNorm,
          },
        },
      });
      if (err) throw err;
      await sendPendingEmail(email.trim().toLowerCase(), nome.trim(), nomeTurma.trim());
      navigate('/cadastro-sucesso');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-indigo-500/5 overflow-hidden p-8">
          <div className="flex items-center justify-center mb-8">
            <Link to="/" className="flex items-center" aria-label="Gradly">
              <div
                className="h-10 w-[150px] shrink-0"
                style={{
                  WebkitMaskImage: "url('/gradly.svg')",
                  maskImage: "url('/gradly.svg')",
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  backgroundColor: '#6366F1',
                }}
              />
            </Link>
          </div>

          <div className="flex gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step >= s ? 'bg-indigo-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-bold text-slate-50">Dados de acesso</h2>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className={inputClass}
                    required
                    minLength={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    E-mail (institucional ou pessoal)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className={inputClass}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (
                    <p className={`mt-1 text-xs ${pwStrength.color}`}>
                      Senha: {pwStrength.label}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-bold text-slate-50">Dados da turma</h2>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">WhatsApp</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => { setPaisWhatsapp('br'); setWhatsapp(''); }}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                        paisWhatsapp === 'br'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      🇧🇷 Brasil +55
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPaisWhatsapp('py'); setWhatsapp(''); }}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                        paisWhatsapp === 'py'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      🇵🇾 Paraguay +595
                    </button>
                  </div>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={handleWhatsAppChange}
                    placeholder={paisWhatsapp === 'br' ? '(00) 00000-0000' : '9XX XXX XXX'}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Nome da turma
                  </label>
                  <input
                    type="text"
                    value={nomeTurma}
                    onChange={(e) => setNomeTurma(e.target.value)}
                    placeholder='Ex: Medicina UPE - 3º Ano'
                    className={inputClass}
                    required
                    minLength={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Slug (URL personalizada)
                  </label>
                  <input
                    type="text"
                    value={slugDesejado}
                    onChange={handleSlugChange}
                    placeholder="Ex: med4c"
                    className={`${inputClass} ${
                      slugAvailable === true
                        ? 'ring-1 ring-emerald-500/50'
                        : slugAvailable === false
                          ? 'ring-1 ring-red-500/50'
                          : ''
                    }`}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    URL: gradly.to/t/{slugNorm || 'slug'}
                  </p>
                  {slugNorm.length >= 2 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      {slugChecking ? (
                        <Loader2 size={14} className="animate-spin text-slate-400" />
                      ) : slugAvailable === true ? (
                        <>
                          <Check size={14} className="text-emerald-500" />
                          <span className="text-xs text-emerald-500">Disponível</span>
                        </>
                      ) : slugAvailable === false ? (
                        <>
                          <X size={14} className="text-red-500" />
                          <span className="text-xs text-red-500">Indisponível</span>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
            )}

            <div className="flex gap-2 pt-2">
              {step === 2 && (
                <motion.button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  Voltar
                </motion.button>
              )}
              {step === 1 ? (
                <motion.button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canSubmitStep1}
                  className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próximo
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={!canSubmitStep2 || isSubmitting}
                  className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" strokeWidth={2} />
                  ) : (
                    'Enviar solicitação'
                  )}
                </motion.button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Já tem conta?{' '}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
