import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEO } from "./SEO";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ScrollAnimation } from "./ui/ScrollAnimation";
import { useDocumentTitle } from "../hooks/useDocumentTitle";


const branches = [
  {
    name: "Mataas Na Lupa Lipa City",
    description: "SMS Tyre Depot Lipa City has been serving the community since 1995, providing quality tyres and exceptional service.",
    address: "W5V3+79P, J.M Katigbak St., Lipa City, 4217 Batangas",
    phone: "+63 917 706 0025",
    email: "smstyredepotlipa@gmail.com",
    map: "https://www.google.com/maps?q=13.943217600707708,121.15347730817392&hl=en&z=15&output=embed",
  },
  {
    name: "Sabang Lipa City",
    description: "SMS Tyre Depot Sabang Lipa City branch provides quality tyres and tyre services since 2000.",
    address: "W5X8+Q98, Lipa City, Batangas",
    phone: "+63 912 345 6789",
    email: "batangas@smstyredepot.com",
    map: "https://www.google.com/maps?q=13.948292033923693, 121.16603344785213&hl=en&z=15&output=embed",
  },
  {
    name: "Goodyear Autocare - SMS Tyre Depot",
    description: "San Pablo branch focuses on wheel alignment, balancing, and tyre repairs with top-notch service.",
    address: "1st Street, 1, San Pablo City, 4000 Laguna",
    phone: "+63 923 456 7890",
    email: "tanauan@smstyredepot.com",
    map: "https://www.google.com/maps?q=14.07118937213174, 121.30524446426367&hl=en&z=15&output=embed",
  },
];

export function ContactPage() {
  useDocumentTitle("Contact Us");

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <SEO
        title="Contact Us"
        description="Have questions about our tyres or services? Get in touch with SMS Tyre Depot. Our team is here to help you get back on the road safely."
      />
      <Header />

      {/* Hero Section - Matching ServicesPage */}
      <div className="pt-40 pb-24 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <ScrollAnimation variant="fade-up">
              <span className="text-blue-600 font-bold tracking-[0.2em] text-[10px] uppercase mb-4 block">Get In Touch</span>
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-8 tracking-tight font-display uppercase">Contact Us</h1>
              <p className="text-xl text-slate-500 max-w-3xl leading-relaxed">
                Find us or get in touch. We are here to help you with your tyre needs. Visit any of our <span className="text-blue-600 font-bold">three locations</span> or reach out to us directly.
              </p>
            </ScrollAnimation>
          </div>
        </div>
      </div>

      <main className="flex-grow">
        {/* Branches Grid - Matching ServicesPage */}
        <section className="py-24 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {branches.map((branch, index) => (
              <ScrollAnimation
                key={index}
                variant="fade-up"
                delay={index * 50}
                className="h-full"
              >
                <div className="group bg-white flex flex-col h-full border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
                  {/* Map Preview */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <iframe
                      title={branch.name}
                      src={branch.map}
                      className="w-full h-full border-0 grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                      loading="lazy"
                    />
                  </div>

                  {/* Branch Info */}
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                      {branch.name}
                    </h3>
                    <p className="text-slate-500 leading-relaxed mb-6 flex-grow text-sm lg:text-base">
                      {branch.description}
                    </p>

                    {/* Contact Details */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">{branch.address}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <p className="text-sm text-slate-600">{branch.phone}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <p className="text-sm text-slate-600">{branch.email}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="text-sm text-slate-600">
                          <p>Mon-Sat: 8:00 AM - 7:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
