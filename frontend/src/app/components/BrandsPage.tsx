import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEO } from "./SEO";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Link } from "react-router-dom";
import { useProductStore } from "../stores/productStore";
import { ScrollAnimation } from "./ui/ScrollAnimation";
import { ArrowRight, Loader2 } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useState, useRef, useEffect } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "./ui/pagination";

export function BrandsPage() {
    useDocumentTitle("Our Brands | SMS Tyre Depot");
    const products = useProductStore((state) => state.products);
    const setFilters = useProductStore((state) => state.setFilters);
    const [brands, setBrands] = useState<any[]>([]);
    const [loadingBrands, setLoadingBrands] = useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch("/api/products/brands");
                const data = await response.json();
                setBrands(data.brands || []);
            } catch (error) {
                console.error("Error fetching brands:", error);
            } finally {
                setLoadingBrands(false);
            }
        };
        fetchBrands();
    }, []);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const brandGridRef = useRef<HTMLDivElement>(null);

    const getBrandProducts = (brandName: string) => {
        return products.filter((p) => p.brand === brandName);
    };

    // Calculate pagination
    const totalPages = Math.ceil(brands.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBrands = brands.slice(startIndex, startIndex + itemsPerPage);

    // Scroll to top of grid on page change
    useEffect(() => {
        if (currentPage > 1 && brandGridRef.current) {
            const offset = 120; // Account for fixed header
            const elementPosition = brandGridRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }, [currentPage]);

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans flex flex-col">
            <SEO
                title="Premium Tyre Brands"
                description="Explore our wide range of world-class tyre brands including Michelin, Bridgestone, Goodyear, Continental, and more."
            />
            <Header />

            {/* Hero Section */}
            <div className="relative pt-48 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl -z-10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-4xl mx-auto">
                        <ScrollAnimation variant="fade-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                                <span className="text-blue-600 font-black tracking-widest text-[10px] uppercase">Official Partners</span>
                            </div>
                            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 mb-8 tracking-tighter">
                                World-Class <span className="text-blue-600">Performance</span>
                            </h1>
                            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                                We partner with global leaders in tyre technology to bring you maximum safety, durability, and a premium driving experience.
                            </p>
                        </ScrollAnimation>
                    </div>
                </div>
            </div>

            <main className="flex-grow pb-32">
                <div className="container mx-auto px-4" ref={brandGridRef}>
                    {loadingBrands ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {paginatedBrands.map((brand, index) => {
                                const brandProducts = getBrandProducts(brand.name);
                                return (
                                    <ScrollAnimation
                                        key={brand.name}
                                        variant="fade-up"
                                        delay={index * 50}
                                        className="h-full"
                                    >
                                        <Link
                                            to={`/products?brand=${encodeURIComponent(brand.name)}`}
                                            onClick={() => setFilters({ brand: brand.name })}
                                            className="group relative bg-white rounded-[2rem] p-8 border border-white shadow-xl shadow-slate-200/50 flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 overflow-hidden"
                                        >


                                            <div className="relative z-10">
                                                <div className="aspect-video bg-white rounded-2xl mb-8 flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group-hover:border-blue-100 transition-colors duration-500">
                                                    <ImageWithFallback
                                                        src={brand.logo}
                                                        alt={brand.name}
                                                        className="max-w-[80%] max-h-[80%] w-auto h-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110"
                                                    />
                                                </div>

                                                <h3 className="text-3xl font-black mb-3 text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">
                                                    {brand.name}
                                                </h3>

                                                <p className="text-slate-500 mb-8 leading-relaxed text-sm font-medium">
                                                    {brand.description}
                                                </p>

                                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inventory</span>
                                                        <span className="text-sm font-bold text-slate-900">
                                                            {brandProducts.length} <span className="text-slate-400 font-medium">Items Available</span>
                                                        </span>
                                                    </div>

                                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 group-hover:rotate-45">
                                                        <ArrowRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>


                                        </Link>
                                    </ScrollAnimation>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-20">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                                            }}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <PaginationItem key={i + 1}>
                                            <PaginationLink
                                                href="#"
                                                isActive={currentPage === i + 1}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(i + 1);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                                            }}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
