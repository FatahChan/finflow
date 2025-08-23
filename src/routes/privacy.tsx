import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
  ssr: true,
});

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 mb-4">
                FinFlow ("we," "our," or "us") is committed to protecting your
                privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                personal finance management application.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                Personal Information
              </h3>
              <p className="text-gray-700 mb-4">
                We may collect the following personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  Name and contact information (email address, phone number)
                </li>
                <li>Account credentials and authentication information</li>
                <li>Profile information and preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                Financial Information
              </h3>
              <p className="text-gray-700 mb-4">
                With your explicit consent, we may collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Bank account information and transaction data</li>
                <li>Credit card and payment information</li>
                <li>Investment account details</li>
                <li>Income and expense categorizations</li>
                <li>Financial goals and budgets you create</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                Technical Information
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  Device information (IP address, browser type, operating
                  system)
                </li>
                <li>Usage data and analytics</li>
                <li>Log files and error reports</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide and maintain our financial management services</li>
                <li>Process transactions and generate financial reports</li>
                <li>Personalize your experience and provide recommendations</li>
                <li>
                  Communicate with you about your account and our services
                </li>
                <li>Improve our services and develop new features</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Data Security
              </h2>
              <p className="text-gray-700 mb-4">
                We take reasonable measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  Data is stored using InstantDB's security infrastructure
                </li>
                <li>HTTPS encryption for data transmission</li>
                <li>Authentication through secure OAuth providers</li>
                <li>Regular monitoring of our systems</li>
                <li>Limited access to your personal information</li>
              </ul>
              <p className="text-gray-700 mb-4">
                However, no method of transmission over the internet or
                electronic storage is 100% secure. We cannot guarantee absolute
                security of your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Information Sharing and Disclosure
              </h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal financial
                information to third parties. We may share your information only
                in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  <strong>With your consent:</strong> When you explicitly
                  authorize us to share information
                </li>
                <li>
                  <strong>Service providers:</strong> With trusted third-party
                  service providers who assist in operating our service (under
                  strict confidentiality agreements)
                </li>
                <li>
                  <strong>Legal requirements:</strong> When required by law,
                  court order, or government request
                </li>
                <li>
                  <strong>Business transfers:</strong> In connection with a
                  merger, acquisition, or sale of assets (with prior notice)
                </li>
                <li>
                  <strong>Safety and security:</strong> To protect the rights,
                  property, or safety of FinFlow, our users, or others
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Third-Party Services
              </h2>
              <p className="text-gray-700 mb-4">
                We use InstantDB as our database provider and may integrate with
                other third-party services. These services have their own
                privacy policies:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  InstantDB handles data storage and may have access to your
                  information
                </li>
                <li>
                  Authentication services (like Google OAuth) may collect login
                  data
                </li>
                <li>
                  You should review the privacy policies of these third-party
                  services
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Your Privacy Rights
              </h2>
              <p className="text-gray-700 mb-4">
                You have the following rights regarding your personal
                information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  <strong>Access:</strong> Request a copy of the personal
                  information we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information (subject to legal requirements)
                </li>
                <li>
                  <strong>Portability:</strong> Request transfer of your data to
                  another service
                </li>
                <li>
                  <strong>Restriction:</strong> Request limitation of how we
                  process your information
                </li>
                <li>
                  <strong>Objection:</strong> Object to certain types of
                  processing
                </li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise these rights, please contact us at
                privacy@finflow.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. Data Retention
              </h2>
              <p className="text-gray-700 mb-4">
                We retain your information as follows:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Account information: Until you delete your account</li>
                <li>Financial data: As long as you maintain your account</li>
                <li>
                  Usage logs: For a reasonable period to improve our service
                </li>
              </ul>
              <p className="text-gray-700 mb-4">
                Data retention may also be subject to InstantDB's data retention
                policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                9. Cookies and Tracking
              </h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your
                experience:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  <strong>Essential cookies:</strong> Required for basic
                  functionality
                </li>
                <li>
                  <strong>Analytics cookies:</strong> Help us understand how you
                  use our service
                </li>
                <li>
                  <strong>Preference cookies:</strong> Remember your settings
                  and preferences
                </li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookie settings through your browser
                preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                10. Children's Privacy
              </h2>
              <p className="text-gray-700 mb-4">
                Our service is not intended for children under 18 years of age.
                We do not knowingly collect personal information from children
                under 18. If we become aware that we have collected personal
                information from a child under 18, we will delete such
                information promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                11. International Data Transfers
              </h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place to protect your information in accordance with this
                Privacy Policy and applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Posting the updated policy on our website</li>
                <li>Sending you an email notification</li>
                <li>Providing in-app notifications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                13. Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or our privacy
                practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> ahmadfathallah89@gmail.com
                  <br />
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
