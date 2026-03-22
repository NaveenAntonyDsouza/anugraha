import { Heart, Shield, Users, Star, Globe, Handshake } from "lucide-react";

export const metadata = {
  title: "About Us — Anugraha Matrimony",
  description:
    "Learn about Anugraha Matrimony, Karnataka's trusted matrimony portal for all religions and communities.",
};

const STATS = [
  { value: "50,000+", label: "Members" },
  { value: "5,000+", label: "Successful Marriages" },
  { value: "10+", label: "Years of Service" },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Verified Profiles",
    description:
      "Every profile undergoes a thorough verification process to ensure genuine and trustworthy connections.",
  },
  {
    icon: Heart,
    title: "Smart Matching",
    description:
      "Our intelligent matching algorithm connects you with compatible partners based on your preferences.",
  },
  {
    icon: Users,
    title: "All Communities",
    description:
      "We welcome members from all religions and communities across Karnataka and beyond.",
  },
  {
    icon: Star,
    title: "Privacy First",
    description:
      "Your data is safe with us. Advanced privacy controls let you decide who sees your information.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            About Anugraha Matrimony
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Karnataka&apos;s most trusted matrimony portal, connecting hearts
            across all religions and communities since 2014.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold text-primary">
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

      {/* Mission */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            At Anugraha Matrimony, we believe that every person deserves a life
            partner who complements their values, aspirations, and way of life.
            Our mission is to provide a safe, reliable, and inclusive platform
            that helps individuals and families find meaningful matrimonial
            connections within Karnataka and across India.
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            Why Choose Anugraha Matrimony
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-background border rounded-xl p-6 text-center"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Anugraha Matrimony was founded with a simple yet powerful
                vision — to create a matrimony platform that truly serves the
                diverse communities of Karnataka. What started as a small
                initiative has grown into one of the most trusted matrimony
                services in the region.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we serve members from Hindu, Muslim, Christian, Jain, and
                all other communities, helping thousands of families find the
                perfect match for their loved ones. Our dedicated team works
                tirelessly to ensure every member has the best possible
                experience.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-8 flex flex-col items-center justify-center gap-4">
              <Globe className="h-16 w-16 text-primary/60" />
              <Handshake className="h-12 w-12 text-primary/40" />
              <p className="text-sm text-muted-foreground text-center">
                Serving all communities across Karnataka
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
