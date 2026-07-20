export default function LandingFooter() {
  return (
    <footer className="border-t-2 border-dashed border-papel-2 bg-papel-2 px-6 py-10 text-center">
      <span className="font-titulo text-xl font-extrabold text-terracota">
        quintalzim
      </span>
      <p className="mt-2 text-sm text-tinta-suave">Resolve no Quintalzim.</p>
      <p className="mt-1 text-sm text-tinta-suave">
        Feito com carinho no interior do Brasil 🌱
      </p>
      <a
        href="https://instagram.com/quintalzim"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-sm font-semibold text-verde-escuro hover:underline"
      >
        @quintalzim
      </a>
    </footer>
  );
}
