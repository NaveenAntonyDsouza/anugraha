import Link from "next/link";
import { UserPlus, CreditCard, Shield, MessageCircle } from "lucide-react";

const QUICK_LINKS = [
  {
    icon: UserPlus,
    title: "Registration Help",
    description: "Need help creating your profile?",
    href: "/register-free",
  },
  {
    icon: CreditCard,
    title: "Payment Issues",
    description: "Questions about plans or payments?",
    href: "/membership-plans",
  },
  {
    icon: Shield,
    title: "Profile Privacy",
    description: "Control your privacy settings",
    href: "/my-home/profile-settings",
  },
  {
    icon: MessageCircle,
    title: "Contact Support",
    description: "Chat with our support team",
    href: "mailto:support@anugrahamatrimony.com",
  },
];

export function HelpQuickLinks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {QUICK_LINKS.map((link) => (
        <Link
          key={link.title}
          href={link.href}
          className="border rounded-xl p-5 hover:border-primary/50 hover:bg-primary/5 transition-colors group"
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <link.icon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-sm mb-1">{link.title}</h3>
          <p className="text-xs text-muted-foreground">{link.description}</p>
        </Link>
      ))}
    </div>
  );
}
