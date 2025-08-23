import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsOfService,
  ssr: true,
});

function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-4">
                By accessing and using FinFlow ("the Service"), you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-700 mb-4">
                FinFlow is a personal finance management application that helps
                users track their income, expenses, and financial goals. The
                service allows users to connect their financial accounts,
                categorize transactions, and generate financial reports.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. User Account and Security
              </h2>
              <p className="text-gray-700 mb-4">
                You are responsible for maintaining the confidentiality of your
                account and password and for restricting access to your
                computer. You agree to accept responsibility for all activities
                that occur under your account or password.
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  You must provide accurate and complete information when
                  creating an account
                </li>
                <li>
                  You are responsible for keeping your login credentials secure
                </li>
                <li>
                  You must notify us immediately of any unauthorized use of your
                  account
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Financial Data and Privacy
              </h2>
              <p className="text-gray-700 mb-4">
                We take reasonable measures to protect your financial data. By
                using our service, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  You consent to the collection and processing of your financial
                  data as described in our Privacy Policy
                </li>
                <li>Your data is stored using InstantDB's infrastructure</li>
                <li>
                  We do not sell your personal financial information to third
                  parties
                </li>
                <li>You can request deletion of your data at any time</li>
                <li>
                  Data security depends on both our measures and third-party
                  providers
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Prohibited Uses
              </h2>
              <p className="text-gray-700 mb-4">You may not use our service:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  For any unlawful purpose or to solicit others to perform
                  unlawful acts
                </li>
                <li>
                  To violate any international, federal, provincial, or state
                  regulations, rules, laws, or local ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights
                  or the intellectual property rights of others
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, slander, disparage,
                  intimidate, or discriminate
                </li>
                <li>To submit false or misleading information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Service Availability
              </h2>
              <p className="text-gray-700 mb-4">
                We strive to maintain availability of our service, but we do not
                guarantee uninterrupted access. Service availability may depend
                on third-party providers including InstantDB. We reserve the
                right to modify, suspend, or discontinue the service at any time
                without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-700 mb-4">
                FinFlow is provided "as is" without warranties. We shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses, resulting from
                your use of the service. This includes issues arising from
                third-party services like InstantDB.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                8. Termination
              </h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and bar access to the
                service immediately, without prior notice or liability, under
                our sole discretion, for any reason whatsoever and without
                limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                9. Changes to Terms
              </h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material, we
                will provide at least 30 days notice prior to any new terms
                taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                10. Contact Information
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <p className="text-gray-700">Email: ahmadfathallah89@gmail.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
