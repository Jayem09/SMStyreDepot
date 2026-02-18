import React, { useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CreditCard, MapPin, User, Phone, Mail, CheckCircle2 } from "lucide-react";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export function CheckoutPage() {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const { token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    paymentMethod: "gcash", 
  });

  const cartItems = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity
          })),
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_state: formData.state,
          shipping_zip: formData.zipCode,
          shipping_phone: formData.phone,
          paymentMethod: formData.paymentMethod,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        
        clearCart();

        
        if (data.checkout_url) {
          toast.info("Redirecting to secure payment...");
          
          setTimeout(() => {
            window.location.href = data.checkout_url;
          }, 1500);
          return;
        }

        
        setOrderId(data.order.id);
        setOrderPlaced(true);
        if (!data.checkout_url && formData.paymentMethod !== 'store') {
          toast.error(data.message || "Payment gateway unavailable. Order reserved.");
        } else {
          toast.success(data.message || "Order placed successfully!");
        }
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred while placing your order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.12; 
  const shipping = formData.paymentMethod === 'store' ? 0 : (cartItems.length > 0 ? 500 : 0); 
  const total = subtotal + tax + shipping;

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-slate-600 mb-2">Thank you for your purchase.</p>
            <p className="text-slate-600 mb-8">
              Your order number is <span className="font-semibold">#{orderId || "SMS" + Math.floor(Math.random() * 100000)}</span>
            </p>
            <p className="text-sm text-slate-500 mb-8">
              We've sent a confirmation email to {formData.email}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View My Orders
              </Link>
              <Link
                to="/"
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-slate-300">Complete your order</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {}
            <div className="lg:col-span-2 space-y-6">
              {}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  Payment Method
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'gcash', label: 'GCash' },
                    { id: 'maya', label: 'Maya' },
                    { id: 'card', label: 'Credit / Debit Card' },
                    { id: 'store', label: 'Pay in Store (Lipa City)' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                      className={`flex items-center gap-4 p-4 border rounded-xl transition-all text-left ${formData.paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                        }`}
                    >
                      <div>
                        <p className="font-bold text-slate-900">{method.label}</p>
                        <p className="text-xs text-slate-400">
                          {method.id === 'store' ? 'Pay upon installation' : 'Safe & Encrypted'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {formData.paymentMethod === 'card' && (
                  <div className="mt-8 space-y-4 pt-8 border-t border-slate-100">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          required
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          required
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod && formData.paymentMethod !== 'card' && formData.paymentMethod !== 'store' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      You will be redirected to a secure <strong>PayMongo</strong> checkout to complete your {formData.paymentMethod.toUpperCase()} payment.
                    </p>
                  </div>
                )}

                {formData.paymentMethod === 'store' && (
                  <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-xl flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <p className="text-sm text-slate-400">
                      Your order will be reserved. Please visit our depot for fitting and final payment.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span>₱{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>₱{shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-blue-500">₱{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </button>
                <p className="text-xs text-slate-500 text-center mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
