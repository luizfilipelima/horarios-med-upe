interface FooterProps {
  /** Modo compacto para App Shell (StudentView) — logo menor, sem margens extras */
  compact?: boolean;
}

/**
 * Rodapé minimalista com logo Gradly — usado em Admin, Delegado e Aluno
 * Logo com cor #6366F1, responsivo a tema claro/escuro
 * Safe area no bottom para PWA (iOS home indicator)
 */
export function Footer({ compact = false }: FooterProps) {
  return (
    <footer
      className={compact
        ? "flex justify-center items-center"
        : "mt-16 pt-10 pb-[max(2rem,env(safe-area-inset-bottom))] flex justify-center items-center"}
      role="contentinfo"
      aria-label="Gradly"
    >
      <div
        className={`shrink-0 opacity-90 dark:opacity-100 dark:drop-shadow-[0_0_6px_rgba(99,102,241,0.4)] ${compact ? "h-5 w-[60px]" : "h-[22px] w-[72px]"}`}
        style={{
          WebkitMaskImage: "url('/gradly.svg')",
          maskImage: "url('/gradly.svg')",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          backgroundColor: "#6366F1",
        }}
        aria-hidden
      />
    </footer>
  );
}
