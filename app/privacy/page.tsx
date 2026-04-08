import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const firmName = process.env.NEXT_PUBLIC_FIRM_NAME || "Immigration Attorneys";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl text-primary-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-text-tertiary">Version: privacy-en-v1.0 | Last updated: April 2026</p>

        <div className="prose prose-sm mt-8 max-w-none text-text-secondary [&_h2]:font-display [&_h2]:text-primary-900 [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5">
          <h2>1. Data Controller</h2>
          <p>{firmName} (hereinafter, &ldquo;the Firm&rdquo;) is responsible for the processing of your personal data in compliance with applicable U.S. federal and state privacy laws, as well as Mexico&apos;s LFPDPPP where applicable.</p>

          <h2>2. Personal Data We Collect</h2>
          <p>Through our website and WhatsApp messaging service, we may collect:</p>
          <ul>
            <li>Full name</li>
            <li>Phone number</li>
            <li>City of residence</li>
            <li>General description of your immigration inquiry</li>
            <li>IP address and device type</li>
            <li>Browsing data (cookies, referral URL)</li>
          </ul>
          <p><strong>We do not collect</strong> during initial contact: government-issued IDs, Social Security numbers, financial information, medical information, or immigration case numbers.</p>

          <h2>3. Purpose of Processing</h2>
          <ul>
            <li>Respond to your initial immigration inquiry</li>
            <li>Connect you with the appropriate attorney or office</li>
            <li>Follow up on your request</li>
            <li>Improve our services</li>
          </ul>

          <h2>4. Consent</h2>
          <p>By clicking &ldquo;Message us on WhatsApp&rdquo; and sending a message, you provide express consent for us to respond via WhatsApp regarding your inquiry. This consent is recorded with a timestamp, the source URL, and the legal text displayed to you.</p>

          <h2>5. Your Rights</h2>
          <p>You have the right to access, rectify, delete, or object to the processing of your personal data. To exercise these rights, send &ldquo;STOP&rdquo; via WhatsApp or contact us directly.</p>

          <h2>6. Revoking Consent</h2>
          <p>You may revoke your consent at any time by sending &ldquo;STOP&rdquo; via WhatsApp. Revocation will be processed immediately and you will receive no further automated messages.</p>

          <h2>7. Data Security</h2>
          <p>We implement administrative, technical, and physical security measures to protect your personal data against damage, loss, alteration, destruction, or unauthorized use.</p>

          <h2>8. Changes to This Policy</h2>
          <p>We reserve the right to modify this policy. Any changes will be published on this page with a new version and update date.</p>
        </div>
      </main>
      <Footer language="en" />
    </>
  );
}
