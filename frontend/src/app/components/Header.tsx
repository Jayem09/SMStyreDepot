import { ShoppingCart, Search, Menu, User, LogOut, ChevronDown } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useCartStore } from "../stores/cartStore";
import { useProductStore } from "../stores/productStore";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartCount = useCartStore((state) => state.getTotalItems());
  const setSearchQuery = useProductStore((state) => state.setSearchQuery);
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query && window.location.pathname !== '/products') {
      navigate('/products');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="SMS Tyre Depot Logo"
              className="w-44 h-15"
            />
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for tyres by size, brand, or vehicle..."
                className="w-full px-4 py-2 pl-10 bg-slate-100 border border-slate-400 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Cart + Login + Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu / Login */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-24 truncate">
                    {user.name || user.email}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-700 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:block border-t border-slate-100">
          <ul className="flex items-center gap-8 py-3 text-sm">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `transition-colors font-medium ${isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `transition-colors font-medium ${isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`
                }
              >
                Products
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `transition-colors font-medium ${isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`
                }
              >
                Services
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/brands"
                className={({ isActive }) =>
                  `transition-colors font-medium ${isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`
                }
              >
                Brands
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `transition-colors font-medium ${isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`
                }
              >
                Contact
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search tyres..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
                onChange={handleSearch}
              />
            </div>
            <ul className="space-y-1 text-sm">
              {["/", "/products", "/services", "/brands", "/contact"].map(
                (path, idx) => (
                  <li key={idx}>
                    <Link
                      to={path}
                      className="block py-2 px-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {["Home", "Shop Tyres", "Services", "Brands", "Contact"][
                        idx
                      ]}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
