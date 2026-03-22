"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-input sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-sm text-foreground leading-tight">
                Anugraha Matrimony
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Connecting Hearts
              </p>
            </div>
          </Link>

          {/* Desktop center nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/success-stories"
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              Success Stories
            </Link>
            <Link
              href="/help"
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              Help
            </Link>
          </nav>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              EN
            </span>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
            >
              LOGIN
            </Link>
            <Link
              href="/register-free"
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              REGISTER FREE
            </Link>
          </div>

          {/* Mobile: empty right spacer for centering logo */}
          <div className="md:hidden w-10" />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-input bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/success-stories"
              className="block text-sm text-foreground py-2"
              onClick={() => setMobileOpen(false)}
            >
              Success Stories
            </Link>
            <Link
              href="/help"
              className="block text-sm text-foreground py-2"
              onClick={() => setMobileOpen(false)}
            >
              Help
            </Link>
            <hr className="border-input" />
            <Link
              href="/login"
              className="block text-center py-2.5 text-sm font-medium border border-primary text-primary rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              LOGIN
            </Link>
            <Link
              href="/register-free"
              className="block text-center py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              REGISTER FREE
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
