import { Header } from "./Header";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Link } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "../stores/cartStore";
import { ScrollAnimation } from "./ui/ScrollAnimation";

export function CartPage() {
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.1; // 10% tax
  const shipping = cartItems.length > 0 ? 15.99 : 0;
  const total = subtotal + tax + shipping;

  const handleUpdateQuantity = (id: number, delta: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + delta);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <ScrollAnimation variant="fade-up">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Shopping Cart</h1>
            <p className="text-slate-500 mb-12">Review your selected items and proceed to secure checkout.</p>
          </ScrollAnimation>

          {cartItems.length === 0 ? (
            <ScrollAnimation variant="scale-up" duration={500}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Your cart is empty</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">Looks like you haven't added any tyres to your cart yet. Browse our collection to find the perfect fit.</p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                >
                  Browse Products
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </ScrollAnimation>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item, index) => (
                  <ScrollAnimation key={item.id} variant="fade-up" delay={index * 100}>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row gap-6 transition-all hover:border-blue-200 hover:shadow-md">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 h-32 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 block">{item.brand}</span>
                            <Link to={`/product/${item.id}`} className="font-bold text-lg text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                              {item.name}
                            </Link>
                            <p className="text-sm text-slate-500 mt-1">Size: {item.size} • Type: {item.type}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-blue-500 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            title="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-50">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-600 hidden sm:inline">Qty:</span>
                            <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-200">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 shadow-sm hover:text-blue-600 transition-colors disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 shadow-sm hover:text-blue-600 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900">
                              ₱{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-xs text-slate-500">
                                ₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} each
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollAnimation>
                ))}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <ScrollAnimation variant="fade-up" delay={200}>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 sticky top-32">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-medium">₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Tax (10%)</span>
                        <span className="font-medium">₱{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Shipping</span>
                        <span className="font-medium">₱{shipping.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>

                      <div className="border-t border-slate-200 pt-4 mt-4">
                        <div className="flex justify-between items-end">
                          <span className="text-slate-900 font-bold">Total</span>
                          <span className="text-3xl font-bold text-blue-600">
                            ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Link
                        to="/checkout"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                      >
                        Proceed to Checkout
                      </Link>
                      <Link
                        to="/products"
                        className="block w-full text-center text-slate-500 hover:text-slate-900 font-medium py-2 transition-colors hover:underline"
                      >
                        Continue Shopping
                      </Link>
                    </div>

                    {/* Secure Checkout Badge */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-sm">
                      <ShoppingBag className="w-4 h-4" />
                      <span>Secure Checkout</span>
                    </div>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
