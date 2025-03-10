import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';

const PrivacyPolicy = () => {
  return (
    <div>
      <Header />

      <div className="min-h-screen bg-gray-50 py-8 mt-[100px]">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Information Collection</h2>
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">1.1 Personal Information</h3>
                <ul className="list-disc ml-6">
                  <li>Name and contact details (e.g., email, phone number)</li>
                  <li>Address and location data (both physical and IP-based)</li>
                  <li>Payment information (credit card, bank details for processing transactions)</li>
                  <li>Government-issued IDs (for service providers to verify credentials)</li>
                </ul>

                <h3 className="font-medium text-gray-900">1.2 Pet Information</h3>
                <ul className="list-disc ml-6">
                  <li>Pet profiles and medical history (including breed, age, and health conditions)</li>
                  <li>Vaccination records (to ensure pets are up to date on necessary health protocols)</li>
                  <li>Microchip information (for lost & found services)</li>
                  <li>Photos and descriptions (to create profiles for lost pets or available pets for adoption)</li>
                </ul>

                <h3 className="font-medium text-gray-900">1.3 Usage Data</h3>
                <ul className="list-disc ml-6">
                  <li>Service usage patterns (e.g., services accessed, frequency of use)</li>
                  <li>Device and browser information (such as type, version, and settings)</li>
                  <li>IP addresses and location data (to ensure accurate location-based services)</li>
                  <li>Interaction with features (how users interact with our platform, including clicks and navigation)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Data Usage</h2>
              <p>We use the data we collect in the following ways:</p>
              <ul className="list-disc ml-6">
                <li>Service delivery and improvement: To provide and enhance the services available on our platform, ensuring a seamless experience for all users.</li>
                <li>Lost pet matching and notifications: To match lost pets with found pets based on geographical and medical information, and notify users of relevant updates.</li>
                <li>AI-powered recommendations: To personalize pet care advice, services, and products based on the pet’s data (e.g., breed, age, medical history).</li>
                <li>Payment processing: To securely process payments for services rendered, such as pet care or medical consultations.</li>
                <li>Legal compliance: To ensure that we comply with applicable laws, including data protection regulations.</li>
                <li>Communication with users: To notify users of updates, respond to inquiries, or provide customer support.</li>
                <li>Marketing with consent: To send promotional content, offers, or updates, but only if users have opted into receiving such communications.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Data Protection</h2>
              <div className="space-y-3">
                <p>We prioritize the protection of your data and have implemented several security measures:</p>
                <ul className="list-disc ml-6">
                  <li>Encryption of sensitive data: All sensitive information such as payment details and medical records are encrypted to prevent unauthorized access.</li>
                  <li>Regular security audits: We regularly review and audit our security protocols to identify vulnerabilities and address them promptly.</li>
                  <li>Access controls and monitoring: We implement strict access control mechanisms and monitor user activity to prevent unauthorized access to data.</li>
                  <li>Employee training on data protection: Our staff undergoes regular training to stay updated on best practices for data security and privacy.</li>
                  <li>Compliance with Pakistani data protection laws: We ensure that our practices comply with local data privacy regulations to safeguard user rights.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Data Sharing</h2>
              <div className="space-y-3">
                <p>We share data with the following entities:</p>
                <ul className="list-disc ml-6">
                  <li>Veterinary partners: To facilitate medical services, including consultations and emergency care.</li>
                  <li>Verified pet care providers: To connect users with qualified pet care professionals.</li>
                  <li>Payment processors: To securely process transactions and handle refunds or billing inquiries.</li>
                  <li>Legal authorities when required: To comply with legal obligations, such as responding to subpoenas or regulatory requests.</li>
                </ul>
                <p>Third-party data sharing is governed by strict agreements, including:</p>
                <ul className="list-disc ml-6">
                  <li>Confidentiality agreements: To ensure that third parties handle your data with the utmost care and in accordance with our privacy standards.</li>
                  <li>Data protection standards: All third parties must adhere to data protection laws and ethical standards.</li>
                  <li>Service provider vetting: We conduct thorough checks to ensure that our partners comply with relevant privacy regulations before sharing any data.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">5. User Rights</h2>
              <p>As a user, you have the following rights over your personal data:</p>
              <ul className="list-disc ml-6">
                <li>Access your personal data: You can request a copy of your personal data that we have collected.</li>
                <li>Request data corrections: If you believe any of your information is incorrect, you can request us to update it.</li>
                <li>Delete your account: You can request that we delete your account and all associated data, subject to any legal obligations.</li>
                <li>Opt out of marketing: You have the option to unsubscribe from marketing communications at any time.</li>
                <li>Export your data: You can request a copy of your data in a machine-readable format.</li>
                <li>File privacy complaints: If you have concerns about how your data is handled, you can file a complaint with the relevant authorities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">6. Cookies and Tracking</h2>
              <div className="space-y-3">
                <p>We use cookies to improve your experience on our platform:</p>
                <ul className="list-disc ml-6">
                  <li>Essential cookies: These are necessary for the basic functionality of the platform, such as maintaining user sessions.</li>
                  <li>Analytics cookies: These help us understand how you use our platform, allowing us to improve our services over time.</li>
                  <li>Preference cookies: These remember your preferences and settings to enhance your experience each time you visit.</li>
                </ul>
                <p>Users have the option to manage their cookie preferences through their browser settings, including opting out of non-essential cookies.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">7. Children's Privacy</h2>
              <p>We do not knowingly collect data from users under the age of 18. We encourage parents and guardians to supervise their children's use of our platform, and we recommend that children not provide any personal information without parental consent.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">8. International Data Transfers</h2>
              <p>Your data may be processed in countries outside your jurisdiction. These countries may have different privacy laws than your own. We ensure that any international data transfers are safeguarded by appropriate legal mechanisms, such as Standard Contractual Clauses or other safeguards required by applicable laws.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">9. Policy Updates</h2>
              <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Significant changes will be communicated to users through email or via a prominent notice on our platform. Users are encouraged to review this policy periodically.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">10. Contact Information</h2>
              <p>If you have any questions, concerns, or requests regarding your privacy or our practices, please contact us:</p>
              <p>Email: privacy@pawprox.pk</p>
              <p>Phone: [Your Pakistan Phone Number]</p>
              <p>Address: [Your Pakistan Office Address]</p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
