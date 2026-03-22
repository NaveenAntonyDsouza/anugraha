import Link from "next/link";

export function DashboardFooter() {
  return (
    <footer className="bg-white border-t border-input">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Anugraha Matrimony</span>
        <span className="hidden sm:inline">|</span>
        <Link href="/privacy-policy" className="hover:text-primary transition-colors">
          Privacy Policy
        </Link>
        <span className="hidden sm:inline">|</span>
        <Link href="/terms-of-service" className="hover:text-primary transition-colors">
          Terms & Conditions
        </Link>
      </div>
    </footer>
  );
}
