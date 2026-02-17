import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEO } from "./SEO";

export function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <SEO
                title="Privacy Policy"
                description="Learn how SMS Tyre Depot protects your personal information and respects your privacy. Read our latest privacy policy for details on data collection and use."
            />
            <Header />

            <div className="bg-slate-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
                    <p className="text-slate-300">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                        <p className="text-slate-600 mb-2">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
                            <li>Name, email address, phone number, and shipping address</li>
                            <li>Payment information (processed securely through payment processors)</li>
                            <li>Order history and preferences</li>
                            <li>Communication records when you contact us</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                        <p className="text-slate-600 mb-2">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
                            <li>Process and fulfill your orders</li>
                            <li>Send you order confirmations and updates</li>
                            <li>Respond to your inquiries and provide customer support</li>
                            <li>Improve our products and services</li>
                            <li>Send promotional communications (with your consent)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                        <p className="text-slate-600 mb-2">
                            We do not sell your personal information. We may share your information with:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
                            <li>Service providers who assist in our operations (payment processors, shipping companies)</li>
                            <li>Legal authorities when required by law</li>
                            <li>Business partners with your explicit consent</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                        <p className="text-slate-600">
                            We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                        <p className="text-slate-600 mb-2">
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
                            <li>Access and update your personal information</li>
                            <li>Request deletion of your personal information</li>
                            <li>Opt-out of promotional communications</li>
                            <li>Request a copy of your data</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
                        <p className="text-slate-600">
                            For questions about this Privacy Policy, please contact us at smstyredepotlipa@gmail.com or +63 917 706 0025.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </div>
    );
}
