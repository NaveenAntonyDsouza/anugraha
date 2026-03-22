export const metadata = {
  title: "Terms of Service — Anugraha Matrimony",
  description: "Terms and Conditions for using Anugraha Matrimony.",
};

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing or using Anugraha Matrimony (anugrahamatrimony.com), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.

These terms constitute a legally binding agreement between you and Anugraha Matrimony. We reserve the right to update these terms at any time, and continued use of the platform after changes constitutes acceptance.`,
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: `To use Anugraha Matrimony, you must:

• Be at least 18 years of age (21 for males, 18 for females, as per Indian law).
• Be currently unmarried, divorced, or widowed and legally eligible for marriage.
• Be a citizen or resident of India, or an NRI/PIO seeking matrimonial alliances.
• Provide accurate and truthful information during registration.
• Not have been previously banned or removed from the platform.

Profiles created on behalf of others (by parents, siblings, or relatives) must have the consent of the person whose profile is being created.`,
  },
  {
    id: "account-responsibilities",
    title: "3. Account Responsibilities",
    content: `You are responsible for:

• Maintaining the confidentiality of your account credentials.
• All activities that occur under your account.
• Ensuring that information in your profile is accurate, current, and complete.
• Updating your profile promptly if your circumstances change (e.g., if you are no longer seeking a partner).
• Notifying us immediately of any unauthorized access to your account.

You may not share your account with others or create multiple accounts.`,
  },
  {
    id: "prohibited-conduct",
    title: "4. Prohibited Conduct",
    content: `You agree not to:

• Provide false, misleading, or fraudulent information.
• Use the platform for any purpose other than genuine matrimonial search.
• Harass, threaten, or abuse other members.
• Upload inappropriate, obscene, or copyrighted content.
• Scrape, copy, or download profiles or data from the platform.
• Use automated tools, bots, or scripts to access the platform.
• Impersonate another person or misrepresent your identity.
• Solicit money or financial information from other members.
• Use the platform for commercial purposes, advertising, or spam.
• Attempt to bypass security measures or exploit vulnerabilities.

Violation of these terms may result in immediate account suspension or termination.`,
  },
  {
    id: "membership-payments",
    title: "5. Membership & Payments",
    content: `• Free members can create profiles, search, and express limited interest.
• Premium memberships unlock additional features including contact viewing, personalized messages, and dedicated support.
• All payments are processed securely through Razorpay.
• Prices are displayed in Indian Rupees (INR) and are subject to applicable taxes.
• Memberships are non-refundable once activated, except as required by applicable law.
• Membership duration begins from the date of purchase, not first use.
• We reserve the right to modify pricing and plans at any time.`,
  },
  {
    id: "intellectual-property",
    title: "6. Intellectual Property",
    content: `• All content on Anugraha Matrimony — including design, logos, text, graphics, and software — is owned by Anugraha Matrimony and protected by intellectual property laws.
• You retain ownership of content you upload (photos, descriptions) but grant us a non-exclusive license to display it on the platform.
• You may not reproduce, distribute, or create derivative works from our platform content without written permission.`,
  },
  {
    id: "limitation-liability",
    title: "7. Limitation of Liability",
    content: `• Anugraha Matrimony acts as a platform to facilitate introductions. We do not guarantee the accuracy of member profiles or the success of any matrimonial alliance.
• We are not responsible for the conduct, behavior, or actions of any member, whether online or offline.
• We recommend verifying information independently before proceeding with any alliance.
• To the maximum extent permitted by law, Anugraha Matrimony shall not be liable for any indirect, incidental, or consequential damages arising from use of the platform.
• Our total liability shall not exceed the amount paid by you for membership in the preceding 12 months.`,
  },
  {
    id: "termination",
    title: "8. Termination",
    content: `• You may delete your account at any time through Profile Settings.
• We may suspend or terminate accounts that violate these terms, without prior notice.
• Upon termination, your profile will be removed from search results.
• Deleted accounts are soft-deleted and data is retained for 90 days before permanent deletion, as required for legal and safety purposes.
• Certain obligations survive termination, including intellectual property rights and limitation of liability.`,
  },
  {
    id: "governing-law",
    title: "9. Governing Law",
    content: `• These Terms shall be governed by and construed in accordance with the laws of India.
• Any disputes arising from these terms or use of the platform shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.
• If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.

For questions about these Terms, contact us at support@anugrahamatrimony.com.

Last updated: March 2026.`,
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">
        Please read these terms carefully before using Anugraha Matrimony.
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
