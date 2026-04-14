'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';

export default function HomePage() {
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [
    { bg: 'linear-gradient(to right, #1565c0, #0d47a1)', title: 'Mega Electronics Sale', subtitle: 'Up to 80% Off on Electronics', cta: 'Shop Now' },
    { bg: 'linear-gradient(to right, #e65100, #bf360c)', title: 'Fashion Fiesta', subtitle: 'Min 50% Off on Fashion', cta: 'Explore' },
    { bg: 'linear-gradient(to right, #2e7d32, #00695c)', title: 'Home Makeover', subtitle: 'Furniture & Decor from ₹199', cta: 'Shop Now' },
    { bg: 'linear-gradient(to right, #7b1fa2, #ad1457)', title: 'Beauty Bonanza', subtitle: 'Premium Products at Best Prices', cta: 'Discover' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, catRes] = await Promise.all([
          productsAPI.getFeatured(),
          categoriesAPI.getAll(),
        ]);
        setFeatured(featuredRes.data);
        setCategories(catRes.data.categories || []);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-slide banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner Carousel */}
      <section className="relative overflow-hidden" id="hero-banner">
        <div className="relative h-[200px] sm:h-[280px] md:h-[340px]">
          {/* Only render active banner — no cross-fade ghost text */}
          <div
            className="absolute inset-0 flex items-center px-8 sm:px-16"
            style={{ background: banners[currentBanner].bg }}
          >
            <div className="max-w-[1400px] mx-auto w-full animate-fade-in-up" key={currentBanner}>
              <h2 className="text-white text-2xl sm:text-4xl md:text-5xl font-bold mb-2">{banners[currentBanner].title}</h2>
              <p className="text-sm sm:text-lg mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>{banners[currentBanner].subtitle}</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-2.5 rounded-sm font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                {banners[currentBanner].cta} <FiArrowRight />
              </Link>
            </div>
          </div>

          {/* Banner navigation dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentBanner ? 'bg-white w-6' : 'bg-white/50'
                }`}
                onClick={() => setCurrentBanner(i)}
              />
            ))}
          </div>

          {/* Arrows */}
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded p-2 shadow hover:bg-white"
            onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded p-2 shadow hover:bg-white"
            onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-2 sm:px-4">
        {/* Category Icons Row */}
        <section className="bg-white rounded-sm shadow-sm my-3 py-4 px-2" id="category-row">
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 min-w-[80px] group cursor-pointer px-2"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <img
                    src={cat.image_url || 'https://via.placeholder.com/64'}
                    alt={cat.name}
                    className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/64'; }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center whitespace-nowrap group-hover:text-[#2874f0] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Deal of the Day */}
        {featured?.topDeals && featured.topDeals.length > 0 && (
          <ProductSection
            title="Deal of the Day"
            subtitle="Top deals at best prices"
            products={featured.topDeals}
            bgColor="bg-white"
            showTimer={true}
          />
        )}

        {/* Featured Products */}
        {featured?.featuredProducts && featured.featuredProducts.length > 0 && (
          <ProductSection
            title="Best of Electronics"
            subtitle="Handpicked top electronics"
            products={featured.featuredProducts}
            bgColor="bg-white"
          />
        )}

        {/* Best Sellers */}
        {featured?.bestSellers && featured.bestSellers.length > 0 && (
          <ProductSection
            title="Top Rated Products"
            subtitle="Based on customer reviews"
            products={featured.bestSellers}
            bgColor="bg-white"
          />
        )}

        {/* Promo Banner */}
        <section className="my-3 bg-gradient-to-r from-[#2874f0] to-[#6C63FF] rounded-sm p-6 sm:p-10 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1">Flipkart Plus</h3>
              <p className="text-sm text-white/80">Earn SuperCoins on every purchase. Get exclusive deals & early access!</p>
            </div>
            <Link
              href="/flipkart-plus"
              className="bg-white text-[#2874f0] px-6 py-2.5 rounded-sm font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Explore Plus
            </Link>
          </div>
        </section>

        {/* All Products Grid */}
        <section className="bg-white rounded-sm shadow-sm my-3 p-4" id="all-products">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recently Added</h2>
            <Link
              href="/products"
              className="bg-[#2874f0] text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-[#1a5dc8] transition-colors"
            >
              VIEW ALL
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {featured?.bestSellers?.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Horizontal scrollable product section
function ProductSection({ title, subtitle, products, bgColor = 'bg-white', showTimer }) {
  const [scrollRef, setScrollRef] = useState(null);

  const scroll = (dir) => {
    if (scrollRef) {
      scrollRef.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <section className={`${bgColor} rounded-sm shadow-sm my-3 p-4 relative`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {showTimer && <DealTimer />}
          <Link
            href="/products"
            className="bg-[#2874f0] text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-[#1a5dc8] transition-colors whitespace-nowrap"
          >
            VIEW ALL
          </Link>
        </div>
      </div>

      <div className="relative group">
        <div
          ref={setScrollRef}
          className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[180px] max-w-[180px] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Scroll buttons */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-r p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-50"
          onClick={() => scroll(-1)}
        >
          <FiChevronLeft size={20} />
        </button>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-l p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-50"
          onClick={() => scroll(1)}
        >
          <FiChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

// Deal Timer Component
function DealTimer() {
  const [time, setTime] = useState({ hours: 23, minutes: 45, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden sm:flex items-center gap-1.5 text-sm">
      <span className="text-gray-500">Ends in</span>
      {[time.hours, time.minutes, time.seconds].map((val, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-[#212121] text-white px-1.5 py-0.5 rounded text-xs font-mono font-bold min-w-[28px] text-center">
            {String(val).padStart(2, '0')}
          </span>
          {i < 2 && <span className="text-gray-400 font-bold">:</span>}
        </span>
      ))}
    </div>
  );
}

// Loading skeleton
function HomeSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-[280px] skeleton" />
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="bg-white rounded-sm my-3 p-4">
          <div className="flex gap-8 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full skeleton" />
                <div className="w-14 h-3 skeleton" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-sm my-3 p-4">
          <div className="h-6 w-48 skeleton mb-4" />
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[180px]">
                <div className="aspect-square skeleton mb-2" />
                <div className="h-3 w-full skeleton mb-1" />
                <div className="h-4 w-20 skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
