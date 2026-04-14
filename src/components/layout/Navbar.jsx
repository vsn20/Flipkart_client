'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSearch, FiShoppingCart, FiUser, FiHeart, FiChevronDown, FiMenu, FiX, FiLogOut, FiPackage, FiStar } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { productsAPI } from '@/lib/api';
import { debounce } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = debounce(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await productsAPI.searchSuggestions(query);
      setSuggestions(res.data.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    router.push(`/product/${suggestion.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <header className="bg-[#2874f0] sticky top-0 z-50 shadow-md">
        <div className="max-w-[1400px] mx-auto px-4 py-2.5">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white p-1"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex flex-col items-center shrink-0" id="navbar-logo">
              <span className="text-white text-xl font-bold italic tracking-tight">Flipkart</span>
              <span className="flex items-center gap-1 text-[11px] -mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Explore
                <span className="text-[#ffe500] font-medium">Plus</span>
                <span className="text-[10px]">🛡️</span>
              </span>
            </Link>

            {/* Search Bar */}
            <div ref={searchRef} className="flex-1 max-w-[570px] relative hidden sm:block">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  placeholder="Search for Products, Brands and More"
                  className="w-full py-2 px-4 pr-12 rounded-sm text-sm bg-white text-gray-800 outline-none placeholder:text-gray-400"
                  id="navbar-search"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-3.5 text-[#2874f0]"
                >
                  <FiSearch size={20} />
                </button>
              </form>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white shadow-lg border mt-0.5 rounded-sm z-50 max-h-[400px] overflow-y-auto">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 text-sm border-b border-gray-100"
                      onClick={() => handleSuggestionClick(s)}
                    >
                      <FiSearch size={14} className="text-gray-400 shrink-0" />
                      <div>
                        <p className="text-gray-800">{s.text}</p>
                        {s.brand && <p className="text-xs text-gray-400">in {s.brand}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-3 ml-auto">
              {/* Login / User Menu */}
              <div ref={userMenuRef} className="relative">
                {isAuthenticated ? (
                  <button
                    className="flex items-center gap-1.5 text-white px-3 py-1.5 hover:bg-white/10 rounded-sm transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    id="navbar-user-menu"
                  >
                    <FiUser size={18} />
                    <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">
                      {user?.name || 'Account'}
                    </span>
                    <FiChevronDown size={14} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="bg-white text-[#2874f0] px-8 py-1.5 text-sm font-semibold rounded-sm hover:bg-gray-50 transition-colors hidden sm:block"
                    id="navbar-login-btn"
                  >
                    Login
                  </Link>
                )}

                {/* User Dropdown */}
                {showUserMenu && isAuthenticated && (
                  <div className="absolute right-0 top-full mt-1.5 w-[230px] bg-white shadow-xl rounded-sm border z-50 animate-fade-in-up">
                    <div className="p-3 border-b bg-gray-50">
                      <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {user?.plus_tier !== 'none' && (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                          <FiStar size={10} /> Plus {user?.plus_tier}
                        </span>
                      )}
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#f5faff] border-b"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiUser size={16} /> My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#f5faff] border-b"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiPackage size={16} /> Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#f5faff] border-b"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiHeart size={16} /> Wishlist
                    </Link>
                    <Link
                      href="/flipkart-plus"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#f5faff] border-b"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiStar size={16} /> Flipkart Plus
                    </Link>
                    <button
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50"
                      onClick={() => { logout(); setShowUserMenu(false); router.push('/'); }}
                    >
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Become a Seller */}
              <span className="hidden lg:block text-white text-sm font-medium cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-sm transition-colors">
                Become a Seller
              </span>

              {/* More */}
              <div className="hidden lg:block relative group">
                <span className="flex items-center gap-1 text-white text-sm font-medium cursor-pointer px-3 py-1.5 rounded-sm transition-colors" style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  More <FiChevronDown size={14} />
                </span>
                <div className="absolute right-0 top-full w-[220px] bg-white shadow-xl border rounded-sm z-50 hidden group-hover:block">
                  <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-[#f5faff] border-b border-gray-100">
                    🔔 Notification Preferences
                  </button>
                  <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-[#f5faff] border-b border-gray-100">
                    💬 24x7 Customer Care
                  </button>
                  <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-[#f5faff] border-b border-gray-100">
                    📢 Advertise
                  </button>
                  <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-[#f5faff]">
                    📱 Download App
                  </button>
                </div>
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="flex items-center gap-1.5 text-white px-3 py-1.5 hover:bg-white/10 rounded-sm transition-colors relative"
                id="navbar-cart"
              >
                <div className="relative">
                  <FiShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#ff6161] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center animate-bounce-in">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-sm font-medium">Cart</span>
              </Link>

              {/* Mobile Login */}
              {!isAuthenticated && (
                <Link href="/login" className="sm:hidden text-white">
                  <FiUser size={20} />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="sm:hidden mt-2">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for Products, Brands and More"
                className="w-full py-2 px-4 pr-12 rounded-sm text-sm bg-white text-gray-800 outline-none"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3.5 text-[#2874f0]">
                <FiSearch size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Sub Navigation - Category Bar */}
      <SubNav />

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute left-0 top-0 w-[280px] h-full bg-white shadow-xl animate-slide-in overflow-y-auto">
            <div className="p-4 bg-[#2874f0]">
              {isAuthenticated ? (
                <div className="text-white">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs opacity-80">{user?.email}</p>
                </div>
              ) : (
                <Link href="/login" className="text-white font-medium" onClick={() => setShowMobileMenu(false)}>
                  Login & Signup
                </Link>
              )}
            </div>
            <nav className="py-2">
              {[
                { href: '/', label: 'Home', icon: '🏠' },
                { href: '/products', label: 'All Products', icon: '📦' },
                { href: '/cart', label: 'My Cart', icon: '🛒' },
                { href: '/orders', label: 'My Orders', icon: '📋' },
                { href: '/wishlist', label: 'My Wishlist', icon: '❤️' },
                { href: '/flipkart-plus', label: 'Flipkart Plus', icon: '⭐' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

// Sub Navigation Component - matches real Flipkart
function SubNav() {
  const navItems = [
    {
      name: 'Electronics',
      slug: 'electronics',
      hasDropdown: true,
      links: [
        { label: 'Mobiles', slug: 'mobiles' },
        { label: 'Laptops', slug: 'electronics' },
        { label: 'Tablets', slug: 'electronics' },
        { label: 'Headphones', slug: 'electronics' },
        { label: 'Speakers', slug: 'electronics' },
        { label: 'Smart TVs', slug: 'electronics' },
      ],
    },
    {
      name: 'TVs & Appliances',
      slug: 'appliances',
      hasDropdown: true,
      links: [
        { label: 'Televisions', slug: 'electronics' },
        { label: 'Washing Machines', slug: 'appliances' },
        { label: 'Air Conditioners', slug: 'appliances' },
        { label: 'Refrigerators', slug: 'appliances' },
        { label: 'Kitchen Appliances', slug: 'appliances' },
      ],
    },
    {
      name: 'Men',
      slug: 'fashion-men',
      hasDropdown: true,
      links: [
        { label: 'Shirts', slug: 'fashion-men' },
        { label: 'Jeans', slug: 'fashion-men' },
        { label: 'Shoes', slug: 'fashion-men' },
        { label: 'Watches', slug: 'fashion-men' },
        { label: 'T-Shirts', slug: 'fashion-men' },
      ],
    },
    {
      name: 'Women',
      slug: 'fashion-women',
      hasDropdown: true,
      links: [
        { label: 'Kurtas & Kurtis', slug: 'fashion-women' },
        { label: 'Sarees', slug: 'fashion-women' },
        { label: 'Dresses', slug: 'fashion-women' },
        { label: 'Handbags', slug: 'fashion-women' },
        { label: 'Watches', slug: 'fashion-women' },
      ],
    },
    {
      name: 'Baby & Kids',
      slug: 'toys-baby',
      hasDropdown: true,
      links: [
        { label: 'Toys', slug: 'toys-baby' },
        { label: 'Board Games', slug: 'toys-baby' },
        { label: 'Baby Care', slug: 'toys-baby' },
        { label: 'LEGO Sets', slug: 'toys-baby' },
      ],
    },
    {
      name: 'Home & Furniture',
      slug: 'home-furniture',
      hasDropdown: true,
      links: [
        { label: 'Bedsheets', slug: 'home-furniture' },
        { label: 'Curtains', slug: 'home-furniture' },
        { label: 'Furniture', slug: 'home-furniture' },
        { label: 'Mattresses', slug: 'home-furniture' },
      ],
    },
    {
      name: 'Sports, Books & More',
      slug: '',
      hasDropdown: false,
    },
    {
      name: 'Flights',
      slug: '',
      hasDropdown: false,
    },
    {
      name: 'Offer Zone',
      slug: 'products',
      hasDropdown: false,
    },
  ];

  return (
    <nav className="shadow-sm border-b hidden md:block" style={{ background: '#fff' }}>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between px-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <div key={item.name} className="relative group">
              <Link
                href={item.slug ? `/products?category=${item.slug}` : '/products'}
                className="flex items-center gap-0.5 py-3 px-3 text-[13px] font-medium text-gray-800 whitespace-nowrap transition-colors hover:text-[#2874f0]"
              >
                {item.name}
                {item.hasDropdown && <FiChevronDown size={12} className="text-gray-500" />}
              </Link>

              {/* Dropdown Mega Menu */}
              {item.hasDropdown && item.links && (
                <div className="absolute left-0 top-full w-[200px] bg-white shadow-xl border rounded-sm z-50 hidden group-hover:block">
                  {item.links.map((link, idx) => (
                    <Link
                      key={idx}
                      href={`/products?category=${link.slug}`}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f5faff] hover:text-[#2874f0] border-b border-gray-50"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
