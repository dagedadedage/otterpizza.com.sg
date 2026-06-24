export function Footer() {
  return (
    <footer className="bg-gold">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 space-y-1">
        <p
          className="text-center text-white text-xs"
          style={{ fontFamily: "var(--font-chelsea-market)" }}
        >
          &copy; {new Date().getFullYear()} by Otter Pizza Pte Ltd
        </p>
        <p className="text-center">
          <a href="/privacy" className="text-white/70 hover:text-white text-[10px] underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </footer>
  );
}
