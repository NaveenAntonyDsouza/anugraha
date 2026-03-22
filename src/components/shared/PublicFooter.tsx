import Link from "next/link";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-[#1E1E3F] text-white">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* HELP */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">
              Help
            </h3>
            <ul className="space-y-2.5">
              {["FAQ", "Contact Us", "Report Abuse", "Safety Tips"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ABOUT US */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">
              About Us
            </h3>
            <ul className="space-y-2.5">
              {["About Anugraha", "Success Stories", "Careers", "Press"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* INFORMATION */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">
              Information
            </h3>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms & Conditions", "Sitemap"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(/\s+/g, "-").replace("&", "and")}`}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* STAY CONNECTED */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">
              Stay Connected
            </h3>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Youtube, label: "YouTube" },
                { Icon: Twitter, label: "Twitter" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* App download */}
            <div className="mt-6">
              <p className="text-sm text-white/70 mb-3">Download the App</p>
              <div className="flex gap-2">
                <div className="relative">
                  <div className="bg-white/10 rounded-lg px-3 py-2 text-xs text-white/60">
                    App Store
                  </div>
                  <span className="absolute -top-2 -right-2 bg-secondary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                </div>
                <div className="relative">
                  <div className="bg-white/10 rounded-lg px-3 py-2 text-xs text-white/60">
                    Play Store
                  </div>
                  <span className="absolute -top-2 -right-2 bg-secondary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-white/60">
            <span>Call Us</span>
            <span>Toll Free</span>
            <span>Get a Call Back</span>
            <span>Chat Support</span>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Anugraha Matrimony. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
