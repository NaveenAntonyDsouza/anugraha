import Link from "next/link";
import {
  Heart,
  Shield,
  Users,
  CheckCircle,
  Star,
  ChevronDown,
  Smartphone,
} from "lucide-react";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { PublicFooter } from "@/components/shared/PublicFooter";
import { HomeSearchWidget } from "@/components/shared/home-search-widget";

/* ───────── Static data ───────── */

const stats = [
  { label: "Registered Profiles", value: "10,000+" },
  { label: "Successful Matches", value: "500+" },
  { label: "Daily Active Users", value: "2,000+" },
  { label: "Years of Trust", value: "5+" },
];

const highlights = [
  {
    icon: Shield,
    title: "100% Verified Profiles",
    description: "Every profile goes through a strict verification process.",
  },
  {
    icon: Heart,
    title: "Personalised Matchmaking",
    description:
      "Advanced algorithms to find you the most compatible matches.",
  },
  {
    icon: Users,
    title: "All Communities Welcome",
    description:
      "A platform for all religions and communities across Karnataka.",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Register Free",
    description: "Create your profile in under 5 minutes with basic details.",
  },
  {
    step: "2",
    title: "Complete Your Profile",
    description:
      "Add photos, preferences, and family details to get better matches.",
  },
  {
    step: "3",
    title: "Discover Matches",
    description:
      "Browse profiles, use smart search, and find compatible partners.",
  },
  {
    step: "4",
    title: "Connect & Communicate",
    description:
      "Send interest, exchange messages, and take the next step together.",
  },
];

const browseCategories = [
  "Karnataka Matrimony",
  "Hindu Matrimony",
  "Muslim Matrimony",
  "Christian Matrimony",
  "Jain Matrimony",
  "Kannadiga Matrimony",
  "Lingayat Matrimony",
  "Vokkaliga Matrimony",
];

const faqs = [
  {
    q: "Is registration free on Anugraha Matrimony?",
    a: "Yes! Registration is completely free. You can create your profile, browse matches, and set partner preferences without any charges.",
  },
  {
    q: "How do I verify my profile?",
    a: "After registration, you can verify your profile by submitting a government-issued photo ID. Verified profiles get more visibility and trust.",
  },
  {
    q: "Can I hide my profile temporarily?",
    a: "Yes. Go to Profile Settings and enable 'Hide Profile'. Your profile will be hidden from search results until you unhide it.",
  },
  {
    q: "Is my information safe?",
    a: "Absolutely. We follow strict data protection practices. Your contact details are only shared with members you approve.",
  },
  {
    q: "What communities does Anugraha Matrimony support?",
    a: "We welcome all religions and communities across Karnataka — Hindu, Muslim, Christian, Jain, and more.",
  },
];

/* ───────── Page ───────── */

export default function HomePage() {
  return (
    <>
      <PublicHeader />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/90 to-primary min-h-[520px] flex items-center">
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Find Your Perfect <br className="hidden sm:block" />
                Life Partner
              </h1>
              <p className="text-white/80 text-lg max-w-lg mx-auto lg:mx-0 mb-8">
                Karnataka&apos;s most trusted matrimony portal for all
                communities. Register free and start your journey today.
              </p>
              <div className="flex gap-3 justify-center lg:justify-start">
                <Link
                  href="/register-free"
                  className="h-11 px-6 bg-white text-primary rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors flex items-center"
                >
                  Register Free
                </Link>
                <Link
                  href="/login"
                  className="h-11 px-6 border border-white/40 text-white rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors flex items-center"
                >
                  Login
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0">
              <HomeSearchWidget />
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-white border-b border-input">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="bg-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">
              Why Choose Anugraha Matrimony?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-xl p-6 text-center shadow-sm border border-input"
                >
                  <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">
              How It Works
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Banner */}
        <section className="bg-gradient-to-r from-primary to-secondary py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Star className="h-10 w-10 text-white mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Upgrade to Premium
            </h2>
            <p className="text-white/80 max-w-md mx-auto mb-6">
              Get unlimited matches, view contact details, and enjoy priority
              support with our Premium membership.
            </p>
            <Link
              href="/membership-plans"
              className="inline-flex h-11 px-8 bg-white text-primary rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors items-center"
            >
              View Plans
            </Link>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="bg-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {browseCategories.map((cat) => (
                <Link
                  key={cat}
                  href="/register-free"
                  className="bg-white rounded-lg p-4 text-center text-sm font-medium text-foreground shadow-sm border border-input hover:border-primary hover:shadow-md transition-all"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Success Stories
            </h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              Thousands of happy couples found their soulmate through Anugraha
              Matrimony.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-muted/30 rounded-xl p-6 border border-input"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-3">
                    &ldquo;We found each other on Anugraha Matrimony and
                    couldn&apos;t be happier. The platform made everything so
                    simple!&rdquo;
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Happy Couple {i}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/success-stories"
              className="inline-flex items-center mt-8 text-sm font-semibold text-primary hover:underline"
            >
              Read More Stories
            </Link>
          </div>
        </section>

        {/* App Download */}
        <section className="bg-primary/5 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Download Our App
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Stay connected on the go. Get instant notifications for new
                matches and messages.
              </p>
              <div className="flex gap-3 justify-center md:justify-start">
                <span className="inline-flex items-center gap-2 h-11 px-5 bg-muted rounded-lg text-sm text-muted-foreground border border-input">
                  <Smartphone className="h-4 w-4" />
                  Coming Soon
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 w-48 h-48 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Smartphone className="h-16 w-16 text-primary/40" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Ready to Find Your Life Partner?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Join thousands of happy couples who found their match on Anugraha
              Matrimony.
            </p>
            <Link
              href="/register-free"
              className="inline-flex h-12 px-8 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors items-center"
            >
              Register Free Now
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <FAQSection />
      </main>

      <PublicFooter />
    </>
  );
}

/* ───────── FAQ Accordion (client component inlined) ───────── */

function FAQSection() {
  return (
    <section className="bg-muted/30 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white rounded-lg border border-input overflow-hidden"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-foreground list-none [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180 flex-shrink-0 ml-2" />
              </summary>
              <div className="px-4 pb-4 text-sm text-muted-foreground">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
