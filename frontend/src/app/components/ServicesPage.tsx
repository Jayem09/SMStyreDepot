import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEO } from "./common/SEO";
import { ArrowRight, Wrench, ShieldCheck, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollAnimation } from "./ui/ScrollAnimation";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ImageWithFallback } from "./figma/ImageWithFallback";


export function ServicesPage() {
  useDocumentTitle("World-Class Services");
  const services = [
    {
      title: "REPAIR / PMS",
      description:
        "Highest quality auto repair and maintenance services. Our process is transparent: we diagnose, identify, and provide estimates before any work begins.",
      image:
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "AUTO DETAILING",
      description:
        "Professional cleaning, restoration, and finishing of your vehicle, both inside and out, to produce a show-quality level of detail.",
      image:
        "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "OFF ROAD SET-UP",
      description:
        "Elevate your ride. Explore our selection of custom mags and high-performance tires, expertly fitted to enhance both style and performance.",
      image:
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "COMPUTERIZED SCANNING",
      description:
        "Precision diagnostics using advanced computerized alignment and scanning technology for safer, smoother handling and performance.",
      image:
        "https://img.freepik.com/free-photo/hands-mechanic-using-diagnostic-tool_1170-1188.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      title: "INSTALLATION",
      description:
        "Expert fitting and installation of premium tyres, custom wheels, and high-quality automotive components for maximum reliability.",
      image:
        "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <SEO
        title="World-Class Tyre Services"
        description="From expert fitting and balancing to wheel alignment and safety checks, our certified technicians ensure your vehicle performs at its best."
      />
      <Header />

      {}
      <div className="pt-40 pb-24 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <ScrollAnimation variant="fade-up">
              <span className="text-blue-600 font-bold tracking-[0.2em] text-[10px] uppercase mb-4 block">Professional Care</span>
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-8 tracking-tight font-display uppercase">Our Services</h1>
              <p className="text-xl text-slate-500 max-w-3xl leading-relaxed whitespace-pre-wrap">
                Experience the highest quality auto repair and maintenance services at <span className="text-blue-600 font-bold">SMS Tyre Depot</span>. Your vehicle receives the expert care it deserves. Our process is transparent: we diagnose the issue, identify necessary replacements, and provide a free estimate before any work begins.
              </p>
            </ScrollAnimation>
          </div>
        </div>
      </div>

      <main className="flex-grow">
        {}
        <section className="py-24 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {services.map((service, index) => (
              <ScrollAnimation
                key={index}
                variant="fade-up"
                delay={index * 50}
                className="h-full"
              >
                <div className="group bg-white flex flex-col h-full">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-8 border border-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:-translate-y-1">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed mb-8 flex-grow text-sm lg:text-base">
                      {service.description}
                    </p>
                    <Link
                      to="/contact"
                      className="relative z-10 inline-flex items-center gap-2 text-slate-900 font-bold group-hover:text-blue-600 transition-colors text-sm uppercase tracking-widest"
                    >
                      Explore Service <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </section>

        {}
        <section className="py-24 bg-slate-50 border-y border-slate-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {[
                {
                  icon: Wrench,
                  title: "Advanced Equipment",
                  text: "Using the latest diagnostic and repair tools for precision."
                },
                {
                  icon: ShieldCheck,
                  title: "Certified Experts",
                  text: "Our technicians are trained and certified for all vehicle types."
                },
                {
                  icon: Timer,
                  title: "Quick Turnaround",
                  text: "Fast service without compromising quality to get you back on the road."
                }
              ].map((item, i) => (
                <ScrollAnimation key={i} variant="fade-up" delay={i * 100}>
                  <div className="flex flex-col">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">{item.text}</p>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
