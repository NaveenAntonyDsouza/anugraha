"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Phone, Mail, PhoneCall } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { FAQAccordion } from "@/components/public/faq-accordion";
import { HelpQuickLinks } from "@/components/public/help-quick-links";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const PLACEHOLDER_FAQS: FAQ[] = [
  {
    id: "f1",
    question: "How do I register on Anugraha Matrimony?",
    answer:
      'Click the "Register Free" button on the homepage. Fill in your basic details across 5 simple steps, verify your mobile number with OTP, and your profile will be created.',
    category: "Registration",
  },
  {
    id: "f2",
    question: "Is registration free?",
    answer:
      "Yes, registration is completely free. You can create your profile, search for matches, and express interest at no cost. Premium memberships unlock additional features like viewing contact details.",
    category: "Registration",
  },
  {
    id: "f3",
    question: "How do I upgrade to a premium plan?",
    answer:
      'Go to the "Membership Plans" page from the menu. Choose a plan that suits your needs and complete the payment through Razorpay. Your premium features will be activated instantly.',
    category: "Payments",
  },
  {
    id: "f4",
    question: "What payment methods are accepted?",
    answer:
      "We accept all major payment methods through Razorpay including credit/debit cards, UPI, net banking, and wallets.",
    category: "Payments",
  },
  {
    id: "f5",
    question: "How do I hide my profile from search results?",
    answer:
      'Go to Profile Settings and enable "Hide Profile from Search". Your profile will not appear in search results but your existing connections will still be able to see your profile.',
    category: "Privacy & Security",
  },
  {
    id: "f6",
    question: "How do I delete my account?",
    answer:
      'Go to Profile Settings and scroll to "Delete Profile". Follow the 3-step confirmation process. Your data will be retained for 90 days before permanent deletion.',
    category: "Privacy & Security",
  },
  {
    id: "f7",
    question: "How do I send an interest message?",
    answer:
      "Visit a profile you like and click the heart icon or the \"Send Interest\" button. Choose a message template or write a personalized message (premium feature). The member will be notified.",
    category: "Communication",
  },
  {
    id: "f8",
    question: "How many interests can I send per day?",
    answer:
      "Free members can send up to 5 interest messages per day. Premium members can send up to 50 per day.",
    category: "Communication",
  },
];

export default function HelpPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function fetchFaqs() {
    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer, category")
      .eq("is_visible", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      setFaqs(PLACEHOLDER_FAQS);
    } else {
      setFaqs(data);
    }
    setLoading(false);
  }

  const memoizedFaqs = useMemo(() => faqs, [faqs]);

  return (
    <div>
      {/* Hero with search */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            How can we help you?
          </h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for answers..."
              className="pl-12 h-12 text-foreground bg-white border-0 rounded-xl shadow-lg"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <FAQAccordion faqs={memoizedFaqs} searchQuery={searchQuery} />
        )}
      </section>

      {/* Quick Links */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold mb-6 text-center">Quick Links</h2>
        <HelpQuickLinks />
      </section>

      {/* Contact Section */}
      <section className="bg-muted/30 border-t py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl font-bold text-center mb-8">
            Still need help? Contact us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Call Us</p>
              <p className="text-sm text-muted-foreground">+91 484 4080333</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PhoneCall className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Toll Free</p>
              <p className="text-sm text-muted-foreground">1800-103-4080</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                support@anugrahamatrimony.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
