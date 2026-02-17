import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEO } from "./SEO";

export function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <SEO
                title="Terms & Conditions"
                description="Review the terms and conditions for using SMS Tyre Depot's website and services. Understanding our agreement ensures a smooth experience for all customers."
            />
            <Header />

            <div className="bg-slate-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms and Conditions</h1>
                    <p className="text-slate-300">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-slate-600">
                            By accessing and using SMS Tyre Depot's website and services, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Products and Services</h2>
                        <p className="text-slate-600 mb-2">
                            SMS Tyre Depot provides tyre sales and related automotive services. All products are subject to availability.
                        </p>
                        <p className="text-slate-600">
                            Product prices are subject to change without notice. We reserve the right to modify or discontinue products at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Orders and Payment</h2>
                        <p className="text-slate-600 mb-2">
                            All orders are subject to acceptance by SMS Tyre Depot. We reserve the right to refuse or cancel any order.
                        </p>
                        <p className="text-slate-600">
                            Payment must be made in full at the time of order. We accept cash, credit cards, and other approved payment methods.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Warranty and Returns</h2>
                        <p className="text-slate-600 mb-2">
                            All tyres come with manufacturer warranties. Returns are accepted within 30 days of purchase, subject to our return policy.
                        </p>
                        <p className="text-slate-600">
                            Tyres must be in original condition and packaging for returns to be accepted.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
                        <p className="text-slate-600">
                            SMS Tyre Depot shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Contact Information</h2>
                        <p className="text-slate-600">
                            For questions about these Terms and Conditions, please contact us at smstyredepotlipa@gmail.com or +63 917 706 0025.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </div>
    );
}
