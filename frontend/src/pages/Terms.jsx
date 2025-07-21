import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Terms = () => {
  return (
    <div>
        <Header/>

        <div className="min-h-screen bg-gray-50 py-8 mt-[100px]">
          <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
            
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Agreement to Terms</h2>
                <p>By accessing or using PawProx's services in Pakistan, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services.</p>
                <p>Your access to and use of the services is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information. Please review our Privacy Policy to understand our practices.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Service Description</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">2.1 Lost & Found Services</h3>
                    <p>- Users can post missing pet alerts and receive notifications about found pets in their area.</p>
                    <p>- We facilitate community assistance but don't guarantee pet recovery.</p>
                    <p>- Users must provide accurate information about lost/found pets to ensure effective matching with potential helpers.</p>
                    <p>- PawProx is not responsible for any incorrect or misleading information posted on the platform.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">2.2 Medical Services</h3>
                    <p>- Access to licensed veterinary professionals is available through online consultations.</p>
                    <p>- We offer online consultation booking and management, enabling users to schedule appointments based on availability.</p>
                    <p>- In case of emergencies, PawProx may refer users to the nearest veterinary clinic or hospital.</p>
                    <p>- Medical consultations offered are for informational purposes and should not replace an in-person visit to a veterinarian.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">2.3 Pet Care Services</h3>
                    <p>- PawProx offers a verified caretaker booking system, allowing users to hire qualified caretakers for their pets.</p>
                    <p>- Service quality standards and monitoring ensure that pet care services meet acceptable industry standards.</p>
                    <p>- Cancellation and refund policies will apply as stated during the booking process.</p>
                    <p>- PawProx will not be held accountable for the actions or negligence of third-party caretakers.</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">2.4 Marketplace</h3>
                    <p>- PawProx provides a platform for buying and selling pets and pet accessories, connecting sellers with potential buyers.</p>
                    <p>- All marketplace transactions must adhere to our guidelines to ensure fair and safe exchanges.</p>
                    <p>- Sellers are required to verify their identity and product information before listing items for sale on the platform.</p>
                    <p>- PawProx reserves the right to remove any listings that violate these terms, including fraudulent or misleading listings.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">3. User Obligations</h2>
                <div className="space-y-2">
                  <p>Users must:</p>
                  <ul className="list-disc ml-6">
                    <li>Be at least 18 years old to use PawProx services.</li>
                    <li>Provide accurate personal and pet information when creating an account or making transactions.</li>
                    <li>Maintain appropriate pet care standards as outlined by relevant pet care guidelines.</li>
                    <li>Comply with all applicable laws and regulations related to pet ownership and animal welfare in Pakistan.</li>
                    <li>Not misuse, exploit, or interfere with the functioning of platform features or services.</li>
                    <li>Report any issues or violations promptly to PawProx support.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">4. AI & Technology Services</h2>
                <div className="space-y-2">
                  <p>Our AI and chatbot services:</p>
                  <ul className="list-disc ml-6">
                    <li>Provide general information only and should not replace professional veterinary advice.</li>
                    <li>Are designed to assist users with common pet care questions but may have limitations in accuracy.</li>
                    <li>Are continuously improving, but we cannot guarantee 100% accuracy at all times.</li>
                    <li>Are not responsible for any actions or decisions made based on the information provided.</li>
                    <li>May be subject to periodic maintenance, resulting in temporary unavailability of services.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">5. Payment Terms</h2>
                <p>- All transactions on PawProx are processed in Pakistani Rupees (PKR), and users must ensure that payments are made in accordance with local currency exchange rates.</p>
                <p>- Service fees are non-refundable unless specified otherwise, and users will be notified of refund policies before finalizing any transaction.</p>
                <p>- Marketplace transactions will follow an escrow policy where funds are held securely until the buyer confirms receipt of the product or service.</p>
                <p>- Users are responsible for any applicable taxes, including sales tax or VAT, as required by local tax authorities.</p>
                <p>- PawProx reserves the right to modify pricing and service fees, with proper notification provided to users in advance.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">6. Liability Limitations</h2>
                <p>PawProx is not liable for:</p>
                <ul className="list-disc ml-6">
                  <li>Pet health outcomes or veterinary advice provided through consultations.</li>
                  <li>Disputes arising from marketplace transactions, including product quality or delivery issues.</li>
                  <li>Quality issues with caretaker services, including negligence or failure to provide services as agreed.</li>
                  <li>Success or failure in locating lost pets or recovering pets posted in the Lost & Found section.</li>
                  <li>Actions or omissions by third-party service providers, including veterinarians, pet care providers, and other partners.</li>
                </ul>
                <p>Our liability is limited to the amount paid by the user for specific services, as applicable, and no indirect, incidental, or consequential damages will be covered.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">7. Account Termination</h2>
                <p>We reserve the right to terminate or suspend user accounts for the following reasons:</p>
                <ul className="list-disc ml-6">
                  <li>Violation of these Terms and Conditions or misuse of platform services.</li>
                  <li>Engagement in fraudulent activity, including identity theft or providing false information.</li>
                  <li>Inappropriate behavior, including harassment, abuse, or violation of other users' rights.</li>
                  <li>Extended inactivity without proper notification or reasonable justification.</li>
                </ul>
                <p>Upon termination, users may lose access to certain services or data stored on the platform, and no refunds will be issued for unused services.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">8. Modifications</h2>
                <p>We reserve the right to modify these terms at any time. Continued use of PawProx after changes constitute acceptance of the modified terms.</p>
                <p>We will notify users of significant changes to the Terms through email or platform notifications. It is the user's responsibility to regularly review these Terms to stay informed about any updates.</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">9. Contact Information</h2>
                <p>If you have any questions or concerns about these Terms and Conditions, please contact us at:</p>
                <p>Email: pawprox2025@gmail.com</p>
                <p>Phone: +92 3408355962</p>
                <p>Address: DHA Phase 7, Karachi, Pakistan</p>
                <p>Our team is available to assist you with any inquiries regarding these Terms.</p>
              </section>
            </div>
          </div>
        </div>

        <Footer/>
    </div>
  );
};

export default Terms;
