import { useState, useEffect, useRef } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SEO } from "./SEO";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ShoppingCart, Filter, Loader2, BarChart2, Heart } from "lucide-react";
import { useCartStore } from "../stores/cartStore";
import { useProductStore } from "../stores/productStore";
import { useComparisonStore } from "../stores/comparisonStore";
import { useWishlistStore } from "../stores/wishlistStore";
import { useAuthStore } from "../stores/authStore";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ScrollAnimation } from "./ui/ScrollAnimation";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { SmartFinder } from "./SmartFinder";
import { SizeSelectorModal } from "./ui/SizeSelectorModal";
import { ComparisonBar } from "./ComparisonBar";
import { RatingStars } from "./ui/RatingStars";


interface Product {
  id: number;
  name: string;
  brand: string;
  size: string;
  type: string;
  price: number;
  rating: number;
  stock: number;
  description?: string;
  image_url?: string;
  image_urls?: string[];
}

const types = ["All Types", "Summer", "All-Season", "Winter"];

export function ProductsPage() {
  const { addToComparison, removeFromComparison, isInComparison } = useComparisonStore();
  const { toggleWishlist, isInWishlist, fetchWishlist } = useWishlistStore();
  const { isAuthenticated, token } = useAuthStore();
  useDocumentTitle("Shop Tyres & Magwheels");
  const [products, setProductsState] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>(["All Brands"]);
  const [sizes, setSizes] = useState<string[]>(["All Sizes"]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const initialBrand = searchParams.get("brand") || "All Brands";
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedSize, setSelectedSize] = useState("All Sizes");
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortBy, setSortBy] = useState("default");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 5 rows * 4 columns = 20 items
  const productGridRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<{
    name: string;
    brand: string;
    description?: string;
    imageUrl?: string;
    imageUrls?: string[];
    variants: { id: number; size: string; price: number; stock: number; type: string }[];
  } | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const setProducts = useProductStore((state) => state.setProducts);
  const setFilters = useProductStore((state) => state.setFilters);
  const searchQuery = useProductStore((state) => state.searchQuery);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      const productList: Product[] = data.products || [];
      setProductsState(productList);
      setProducts(productList);

      // Extract unique brands and sizes from products
      const uniqueBrands = [...new Set(productList.map((p) => p.brand).filter(Boolean))] as string[];
      const uniqueSizes = [...new Set(productList.map((p) => p.size).filter(Boolean))] as string[];

      setBrands(["All Brands", ...uniqueBrands.sort()]);
      setSizes(["All Sizes", ...uniqueSizes.sort()]);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch wishlist if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWishlist(token);
    }
  }, [isAuthenticated, token, fetchWishlist]);

  // Update filters in store
  useEffect(() => {
    setFilters({ brand: selectedBrand, size: selectedSize, type: selectedType });
  }, [selectedBrand, selectedSize, selectedType, setFilters]);

  const filteredProducts = products.filter((product) => {
    const brandMatch = selectedBrand === "All Brands" || product.brand === selectedBrand;
    const sizeMatch = selectedSize === "All Sizes" || product.size === selectedSize;
    const typeMatch = selectedType === "All Types" || product.type === selectedType;
    const searchMatch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.size.toLowerCase().includes(searchQuery.toLowerCase());
    return brandMatch && sizeMatch && typeMatch && searchMatch;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrand, selectedSize, selectedType, searchQuery]);

  // Scroll to products when page changes
  useEffect(() => {
    if (!loading && productGridRef.current && currentPage > 1) {
      const offset = 100; // Account for fixed header
      const elementPosition = productGridRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }, [currentPage, loading]);

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0; // default
  });

  // Grouping products by Name + Brand
  const groupedProducts = sortedProducts.reduce((acc, product) => {
    const key = `${product.brand}-${product.name}`;
    if (!acc[key]) {
      acc[key] = {
        ...product,
        variants: [product]
      };
    } else {
      acc[key].variants.push(product);
    }
    return acc;
  }, {} as Record<string, Product & { variants: Product[] }>);

  const displayProducts = Object.values(groupedProducts);

  // Pagination Logic
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
  const paginatedProducts = displayProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenSelector = (product: Product & { variants: Product[] }) => {
    setModalProduct({
      name: product.name,
      brand: product.brand,
      description: product.description,
      imageUrl: product.image_url,
      imageUrls: product.image_urls || (product.image_url ? [product.image_url] : []),
      variants: product.variants.map(v => ({
        id: v.id,
        size: v.size,
        price: v.price,
        stock: v.stock,
        type: v.type
      }))
    });
    setIsSizeModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      size: product.size,
      type: product.type,
      price: product.price,
      image: product.image_url || "",
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <SEO
        title="Shop Tyres & Magwheels"
        description="Browse our extensive collection of premium tyres and magwheels. Filter by brand, size, or type to find the perfect match for your vehicle."
      />
      <Header />

      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4">
          <ScrollAnimation variant="fade-up">
            <div className="bg-white rounded-2xl p-8 mb-12 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Tyres & Magwheels</h1>
                <p className="text-slate-600">Find the perfect fit for your vehicle</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => useProductStore.getState().setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation variant="fade-up" delay={100}>
            <SmartFinder
              onSizeSelected={(size) => {
                setSelectedSize(size);
              }}
            />
          </ScrollAnimation>

          <div className="flex flex-col lg:flex-row gap-8">


            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
              <ScrollAnimation variant="fade-in" delay={200}>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <h2 className="font-bold text-slate-800">Filters</h2>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                    >
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Size Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tyre Size</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                    >
                      {sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                    <div className="flex flex-wrap gap-2">
                      {types.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${selectedType === type
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                            }`}
                        >
                          {type.replace("All Types", "All")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBrand("All Brands");
                      setSelectedSize("All Sizes");
                      setSelectedType("All Types");
                    }}
                    className="w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </ScrollAnimation>
            </aside>

            {/* Product Grid */}
            <div className="flex-1" ref={productGridRef}>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-slate-600 font-medium">
                  {loading ? "Loading products..." : `Showing ${paginatedProducts.length} of ${displayProducts.length} products`}
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 font-medium">Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-slate-200 rounded-lg bg-white px-3 py-1.5 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="default">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-3 text-slate-600">Loading products...</span>
                </div>
              ) : (

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {paginatedProducts.map((product) => {
                    const minPrice = Math.min(...product.variants.map(v => v.price));
                    const maxPrice = Math.max(...product.variants.map(v => v.price));
                    const isRange = minPrice !== maxPrice;
                    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

                    return (
                      <ScrollAnimation key={`${product.brand}-${product.name}`} variant="fade-up" className="h-full">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all group h-full flex flex-col">
                          <div className="aspect-square bg-slate-50 overflow-hidden relative">
                            <ImageWithFallback
                              src={product.image_url || "/images/tyres/default.jpg"}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {totalStock === 0 && (
                              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Out of Stock</span>
                              </div>
                            )}
                            {product.variants.length > 1 && (
                              <div className="absolute top-2 left-2">
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">{product.variants.length} Sizes</span>
                              </div>
                            )}

                            {/* Comparison Toggle */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isInComparison(product.id)) {
                                  removeFromComparison(product.id);
                                } else {
                                  try {
                                    addToComparison(product);
                                  } catch (err: any) {
                                    toast.error(err.message);
                                  }
                                }
                              }}
                              className={`absolute top-2 right-2 p-2 rounded-lg backdrop-blur-md transition-all z-10 ${isInComparison(product.id)
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-white/80 text-slate-400 hover:text-blue-600 shadow-sm"
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black tracking-tighter transition-all overflow-hidden whitespace-nowrap ${isInComparison(product.id) ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0"
                                  }`}>
                                  SELECTED
                                </span>
                                <BarChart2 className="w-4 h-4" />
                              </div>
                            </button>

                            {/* Wishlist Toggle */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isAuthenticated) {
                                  toast.error("Please login to use wishlist");
                                  return;
                                }
                                if (token) toggleWishlist(String(product.id), token);
                              }}
                              className={`absolute top-12 right-2 p-2 rounded-lg backdrop-blur-md transition-all z-10 ${isInWishlist(String(product.id))
                                ? "bg-rose-500 text-white shadow-lg"
                                : "bg-white/80 text-rose-400 hover:text-rose-600 shadow-sm"
                                }`}
                            >
                              <Heart className={`w-4 h-4 ${isInWishlist(String(product.id)) ? "fill-current" : ""}`} />
                            </button>
                          </div>
                          <div className="p-3 flex flex-col flex-grow">
                            <div className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wide">{product.brand}</div>
                            <Link to={`/product/${product.id}`} className="block mb-1">
                              <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">{product.name}</h3>
                            </Link>

                            <RatingStars rating={product.rating} size={10} className="mb-2" />

                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                              {product.variants.length === 1 ? (
                                <span className="bg-slate-100 px-2 py-1 rounded">{product.size}</span>
                              ) : (
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium">Multiple Sizes</span>
                              )}
                              <span className="bg-slate-100 px-2 py-1 rounded">{product.type}</span>
                            </div>

                            <div className="mt-auto flex items-end justify-between gap-2">
                              <div>
                                <p className="text-[10px] text-slate-500 mb-0.5">Starting at</p>
                                <span className="text-lg font-bold text-slate-900 leading-tight">
                                  ₱{minPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  {isRange && <span className="text-sm font-normal text-slate-400 ml-1"> - ₱{maxPrice.toLocaleString()}</span>}
                                </span>
                              </div>
                              <button
                                onClick={() => handleOpenSelector(product)}
                                disabled={totalStock === 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-bold text-[10px] flex items-center gap-1 shrink-0"
                              >
                                {product.variants.length > 1 ? "SELECT OPTIONS" : <ShoppingCart className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </ScrollAnimation>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1 mx-2">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      let start = Math.max(1, currentPage - 2);
                      let end = Math.min(totalPages, start + maxVisible - 1);

                      if (end - start + 1 < maxVisible) {
                        start = Math.max(1, end - maxVisible + 1);
                      }

                      for (let i = start; i <= end; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === i
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                              }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      return pages;
                    })()}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200 border-dashed mt-8">
                  <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-900 font-medium text-lg mb-2">No products found</p>
                  <p className="text-slate-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                  <button
                    onClick={() => {
                      setSelectedBrand("All Brands");
                      setSelectedSize("All Sizes");
                      setSelectedType("All Types");
                      useProductStore.getState().setSearchQuery("");
                    }}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ComparisonBar />

      {
        modalProduct && (
          <SizeSelectorModal
            isOpen={isSizeModalOpen}
            onClose={() => setIsSizeModalOpen(false)}
            productName={modalProduct.name}
            brand={modalProduct.brand}
            description={modalProduct.description}
            imageUrl={modalProduct.imageUrl}
            imageUrls={modalProduct.imageUrls}
            variants={modalProduct.variants}
            onAddToCart={(variant) => {
              const product = products.find(p => p.id === variant.id);
              if (product) handleAddToCart(product);
            }}
          />
        )
      }
    </div >
  );
}

