import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function CadastroSucessoPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl shadow-indigo-500/5 p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center"
          >
            <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={2} />
          </motion.div>
          <h1 className="text-xl font-bold text-slate-50 mb-2">Tudo certo!</h1>
          <p className="text-slate-400 mb-8">
            Recebemos sua solicitação. O acesso será liberado em breve.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Você receberá um e-mail quando sua conta for aprovada pelo administrador.
          </p>
          <Link
            to="/"
            className="inline-block rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
          >
            Voltar à página inicial
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
