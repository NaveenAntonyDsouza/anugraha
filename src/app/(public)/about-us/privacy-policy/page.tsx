export const metadata = {
  title: "Privacy Policy — Anugraha Matrimony",
  description: "Privacy Policy for Anugraha Matrimony.",
};

const SECTIONS = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: `When you register and use Anugraha Matrimony, we collect the following types of information:

• Personal Information: Name, date of birth, gender, religion, caste, education, occupation, and family details.
• Contact Information: Mobile number, email address, and residential address.
• Profile Data: Photographs, partner preferences, lifestyle details, and hobbies.
• Identity Verification: Government-issued ID proof (Aadhaar, PAN, Passport, etc.) for profile verification.
• Payment Information: Transaction details processed through our payment gateway partner Razorpay. We do not store your card or bank details on our servers.
• Usage Data: Device information, browser type, IP address, pages visited, and interaction patterns.`,
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: `We use your information for the following purposes:

• To create and manage your matrimony profile.
• To match you with compatible profiles based on your preferences.
• To enable communication between members (interest messages, photo requests).
• To verify your identity and maintain platform integrity.
• To process payments for membership plans and add-on packages.
• To send important notifications (new matches, interest messages, account updates).
• To improve our services, features, and user experience.
• To prevent fraud, abuse, and unauthorized access.`,
  },
  {
    id: "data-sharing",
    title: "3. Data Sharing & Third Parties",
    content: `We do not sell your personal information to third parties. We may share your data only in the following cases:

• With Other Members: Your profile information (as per your privacy settings) is visible to other registered members.
• Payment Processing: Transaction data is shared with Razorpay for secure payment processing.
• Cloud Services: Photos are stored on Cloudinary; documents on Supabase Storage — both with encryption.
• Legal Requirements: We may disclose information if required by law, court order, or government request.
• Service Providers: Trusted partners who assist in operating our platform (email services, analytics) under strict confidentiality agreements.`,
  },
  {
    id: "cookies",
    title: "4. Cookies",
    content: `We use cookies and similar technologies to:

• Maintain your login session.
• Remember your preferences and settings.
• Analyze site traffic and usage patterns.
• Improve site performance and user experience.

You can control cookie preferences through your browser settings. Disabling cookies may affect some features of the platform.`,
  },
  {
    id: "data-security",
    title: "5. Data Security",
    content: `We implement industry-standard security measures to protect your data:

• All data transmission is encrypted using SSL/TLS.
• Sensitive documents (ID proofs) are stored in private, encrypted storage buckets.
• Row Level Security (RLS) ensures users can only access their own data.
• Regular security audits and vulnerability assessments.
• Access to personal data is restricted to authorized personnel only.

While we strive to protect your information, no method of electronic transmission or storage is 100% secure.`,
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: `As a user of Anugraha Matrimony, you have the right to:

• Access: View and download your personal data at any time.
• Correction: Update or correct inaccurate information in your profile.
• Deletion: Request deletion of your account and associated data (subject to legal retention requirements).
• Privacy Controls: Control who can see your photos, contact details, and profile information.
• Opt-out: Unsubscribe from promotional communications.
• Data Portability: Request a copy of your data in a structured format.

To exercise these rights, contact us at the details provided below.`,
  },
  {
    id: "contact-us",
    title: "7. Contact Us",
    content: `If you have questions about this Privacy Policy or your data, please contact us:

• Email: support@anugrahamatrimony.com
• Phone: +91 484 4080333
• Toll Free: 1800-103-4080
• Address: Anugraha Matrimony, Bengaluru, Karnataka, India

This Privacy Policy was last updated on March 2026. We may update this policy from time to time and will notify you of significant changes.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        Your privacy is important to us. This policy explains how Anugraha
        Matrimony collects, uses, and protects your personal information.
      </p>

      {/* Quick nav */}
      <nav className="bg-muted/50 rounded-lg p-4 mb-8">
        <p className="text-sm font-medium mb-2">Quick Navigation</p>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs text-primary hover:underline"
            >
              {s.title}
            </a>
          ))}
        </div>
      </nav>

      {/* Sections */}
      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="text-xl font-bold mb-3">{section.title}</h2>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
