/**
 * Rodapé minimalista com logo Gradly — usado em Admin, Delegado e Aluno
 * Logo com cor #6366F1, altura ~22px, responsivo a tema claro/escuro
 */
export function Footer() {
  return (
    <footer
      className="pt-10 pb-8 flex justify-center items-center"
      role="contentinfo"
      aria-label="Gradly"
    >
      <div
        className="h-[22px] w-[72px] shrink-0 opacity-85 dark:opacity-100 dark:drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]"
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
