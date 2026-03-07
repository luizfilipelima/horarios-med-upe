import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, BellRing, Radio, Link2, ArrowRight } from 'lucide-react';

const WHATSAPP_URL =
  'https://wa.me/5575992776610?text=Olá,%20quero%20solicitar%20acesso%20ao%20Gradly%20para%20minha%20turma!';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/" className="flex items-center shrink-0" aria-label="Gradly">
          <div
            className="h-9 w-[140px] shrink-0"
            style={{
              WebkitMaskImage: "url('/gradly.svg')",
              maskImage: "url('/gradly.svg')",
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              backgroundColor: '#6366F1',
            }}
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/cadastro"
            className="text-sm font-medium text-slate-400 hover:text-slate-50 transition-colors"
          >
            Criar conta
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-slate-400 hover:text-slate-50 transition-colors"
          >
            Entrar
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-50 hover:bg-white/10 hover:border-indigo-500/30 transition-colors"
          >
            Solicitar Acesso
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 mb-8"
            >
              <span className="text-sm text-slate-400">✨ A revolução para sua turma</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              A sua faculdade,
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
                finalmente organizada.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10"
            >
              O painel definitivo de horários, links e avaliações. Diga adeus ao caos do grupo do
              WhatsApp e tenha sua rotina acadêmica na palma da mão.
            </motion.p>

            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:bg-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 cta-pulse"
            >
              Solicitar Acesso para minha Turma
              <ArrowRight size={20} strokeWidth={2.5} />
            </motion.a>

            {/* Mockup visual */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-16 sm:mt-20 mx-auto max-w-md"
            >
              <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-2xl shadow-indigo-500/10">
                <div className="space-y-3">
                  <div className="h-4 w-24 rounded-full bg-indigo-500/30" />
                  <div className="h-6 w-full rounded-xl bg-slate-800/80" />
                  <div className="h-6 w-3/4 rounded-xl bg-slate-800/60" />
                  <div className="flex gap-2 mt-4">
                    <div className="h-12 flex-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30" />
                    <div className="h-12 flex-1 rounded-xl bg-slate-800/60" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Bento Box */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: Smartphone,
                  title: 'App Nativo.',
                  desc: 'Instale no seu celular como um app real. Acesso instantâneo, sem precisar digitar sites.',
                },
                {
                  icon: BellRing,
                  title: 'Lembretes Inteligentes.',
                  desc: 'Baixe suas provas e eventos direto para a agenda do celular com alertas de 24h de antecedência.',
                },
                {
                  icon: Radio,
                  title: 'Aulas em Tempo Real.',
                  desc: 'O Gradly sabe que horas são. Abra o app e veja sua aula atual destacada instantaneamente.',
                },
                {
                  icon: Link2,
                  title: "O Fim do 'Cadê o link?'",
                  desc: 'Drive, Zoom, Syllabus e materiais da matéria centralizados a um clique de distância.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  {...fadeInUp}
                  transition={{ ...fadeInUp.transition, delay: i * 0.08 }}
                  className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl shadow-indigo-500/5 hover:border-indigo-500/20 hover:shadow-indigo-500/10 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 mb-4">
                    <item.icon size={22} strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-50 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center rounded-3xl bg-indigo-900/20 border border-indigo-500/20 p-12 sm:p-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-50 mb-4">
              Pronto para evoluir sua turma?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Junte-se às turmas que já não perdem tempo procurando horários perdidos.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 hover:bg-indigo-600 hover:shadow-indigo-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Solicitar Acesso para minha Turma
              <ArrowRight size={20} strokeWidth={2.5} />
            </a>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center" aria-label="Gradly">
              <div
                className="h-7 w-[100px] shrink-0 opacity-80"
                style={{
                  WebkitMaskImage: "url('/gradly.svg')",
                  maskImage: "url('/gradly.svg')",
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  backgroundColor: '#6366F1',
                }}
              />
            </Link>
            <p className="text-sm text-slate-500">© 2026 Gradly. Todos os direitos reservados.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
