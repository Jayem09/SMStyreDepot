
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEO } from "./SEO";
import { StructuredData } from "./StructuredData";
import { ArrowRight, CheckCircle2, Star, Shield, Truck, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollAnimation } from "./ui/ScrollAnimation";
import { motion, AnimatePresence } from "motion/react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { AppointmentSection } from "./AppointmentSection";

interface Product {
  id: number;
  name: string;
  brand: string;
  size: string;
  type: string;
  price: number;
  description?: string;
  image_url?: string;
  is_featured?: boolean;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

export function HomePage() {
  useDocumentTitle("Premium Tyres & Magwheels");
  // Original static content as default
  const defaultProduct: Product = {
    id: 0,
    name: "Michelin Pilot Sport 5",
    brand: "Michelin",
    size: "2019",
    type: "Summer",
    price: 7999,
    description: "Get the most out of your driving experience with the Pilot Sport 5. Engineered for high performance and longevity, ensuring you verify every mile.",
    image_url: "https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&w=1000&q=80",
    is_featured: true
  };

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([defaultProduct]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchReviews();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoPlaying && featuredProducts.length > 1) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, featuredProducts.length]);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch("/api/products?featured=true");
      if (response.ok) {
        const data = await response.json();
        if (data.products && data.products.length > 0) {
          setFeaturedProducts(data.products);
        }
      }
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
    }
  };

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const response = await fetch("/api/reviews");
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  // Helper to determine features list based on product data availability
  const getProductFeatures = (product: Product) => {
    if (!product) return []; // Guard clause
    if (product.id === 0) {
      // Return original static features for default product
      return [
        "Dynamic Response Technology",
        "MaxTouch Construction",
        "Dual Sport Tread Design"
      ];
    }
    // Return dynamic details for fetched products
    return [
      `${product.brand} - ${product.type}`,
      `Size: ${product.size}`,
      `Price: ₱${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    ];
  };

  const currentProduct = featuredProducts[currentIndex];

  if (!currentProduct) return null; // Safe guard for rendering

  // Calculate product features for the *current* product to display
  const currentProductFeatures = getProductFeatures(currentProduct);

  // Features data
  const features = [
    {
      icon: Shield,
      title: "Premium Quality",
      description: "We only stock authentic tyres from world-renowned brands."
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick reliable shipping to get you back on the road safely."
    },
    {
      icon: Clock,
      title: "Expert Service",
      description: "Professional fitting and balancing by certified technicians."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="SMS Tyre Depot | Premium Tyres & Magwheels"
        description="The best collection of high-performance tyres and stylish magwheels in the Philippines. Professional fitting, balancing, and premium services."
      />
      <StructuredData type="LocalBusiness" data={{}} />
      <Header />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollAnimation variant="fade-up" duration={600}>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
                Premium Tyres & <br />
                <span className="text-white/90">Magwheels</span>
              </h1>
            </ScrollAnimation>

            <ScrollAnimation variant="fade-up" delay={100} duration={600}>
              <p className="text-xl text-blue-50 mb-10 max-w-2xl mx-auto leading-relaxed">
                Experience the best ride with our extensive collection of high-performance tyres and stylish magwheels. Professional service guaranteed.
              </p>
            </ScrollAnimation>

            <ScrollAnimation variant="fade-up" delay={200} duration={600}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/services"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  Our Services
                </Link>
                <a
                  href="#appointment"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Book Appointment
                </a>
              </div>
            </ScrollAnimation>

            <ScrollAnimation variant="fade-in" delay={400} duration={800}>
              <div className="mt-12 flex items-center justify-center gap-8 text-blue-50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Authentic Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Expert Installation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Warranty Included</span>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <ScrollAnimation
                key={index}
                variant="fade-up"
                delay={index * 100}
                className="h-full"
              >
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors h-full">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                    <feature.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Product Showcase (Carousel) */}
      <div
        className="py-24 bg-slate-900 text-white overflow-hidden relative"
        onMouseEnter={() => setIsAutoPlaying(true)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="container mx-auto px-4 relative">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col lg:flex-row items-center gap-16"
            >
              <div className="lg:w-2/3">
                <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm mb-4 block">Featured Product</span>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">{currentProduct.name}</h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-2xl">
                  {currentProduct.description || "Experience superior performance and durability with this premium tyre selected just for you."}
                </p>
                <ul className="space-y-4 mb-10">
                  {currentProductFeatures.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-slate-200">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-6">
                  <Link
                    to={currentProduct.id === 0 ? "/products" : `/product/${currentProduct.id}`}
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all hover:scale-105"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              <div className="lg:w-1/3 relative">
                <img
                  src={currentProduct.image_url || "https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&w=1000&q=80"}
                  alt={currentProduct.name}
                  className="relative z-10 w-full rounded-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1578844251758-2f71da645217?auto=format&fit=crop&w=1000&q=80";
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Controls */}
          {featuredProducts.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 mt-8 lg:-bottom-12 lg:mt-0">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                {featuredProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-blue-500" : "w-2 bg-slate-700 hover:bg-slate-600"
                      }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <ScrollAnimation variant="fade-up">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Trusted by Drivers</h2>
              <p className="text-slate-600">
                See what our satisfied customers have to say about our products and services.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoadingReviews ? (
              // Loading state skeletons
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-64 animate-pulse flex flex-col gap-4">
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-16 bg-slate-50 rounded"></div>
                  <div className="mt-auto flex gap-4 items-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : reviews.length > 0 ? (
              reviews.slice(0, 3).map((review, index) => (
                <ScrollAnimation
                  key={review.id}
                  variant="fade-up"
                  delay={index * 100}
                  className="h-full"
                >
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow h-full">
                    <div className="flex gap-1 text-yellow-500 mb-6">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-8 italic line-clamp-4">
                      "{review.comment}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{review.userName}</p>
                        <p className="text-sm text-slate-500">Verified Buyer</p>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))
            ) : (
              // Fallback if no reviews found
              [1, 2, 3].map((i) => (
                <ScrollAnimation
                  key={i}
                  variant="fade-up"
                  delay={i * 100}
                  className="h-full"
                >
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow h-full">
                    <div className="flex gap-1 text-yellow-500 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-8 italic">
                      "Excellent service and great prices. The team at SMS Tyre Depot really knows their stuff. Highly recommended!"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-200 rounded-full" />
                      <div>
                        <p className="font-bold text-slate-900">Happy Customer</p>
                        <p className="text-sm text-slate-500">Verified Buyer</p>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))
            )}
          </div>
        </div>
      </div>

      <AppointmentSection />
      <Footer />
    </div>
  );
}
