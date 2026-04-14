'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

function ProductsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    category: categorySlug,
    min_price: '',
    max_price: '',
    min_rating: '',
    sort: 'relevance',
    search: searchQuery,
    page: 1,
  });

  const [expandedFilter, setExpandedFilter] = useState({
    category: true,
    price: true,
    rating: true,
    brand: false,
  });

  useEffect(() => {
    categoriesAPI.getAll().then((res) => setCategories(res.data.categories || []));
  }, []);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchQuery,
      category: categorySlug,
      page: 1,
    }));
  }, [searchQuery, categorySlug]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.min_rating) params.min_rating = filters.min_rating;
      if (filters.sort) params.sort = filters.sort;
      params.page = filters.page;
      params.limit = 16;

      const res = await productsAPI.getAll(params);
      setProducts(res.data.products || []);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { value: 'rating', label: 'Popularity' },
    { value: 'price_low', label: 'Price -- Low to High' },
    { value: 'price_high', label: 'Price -- High to Low' },
    { value: 'newest', label: 'Newest First' },
  ];

  const ratingOptions = [
    { value: '4', label: '4★ & above' },
    { value: '3', label: '3★ & above' },
    { value: '2', label: '2★ & above' },
    { value: '1', label: '1★ & above' },
  ];

  const priceRanges = [
    { min: '', max: '500', label: 'Under ₹500' },
    { min: '500', max: '1000', label: '₹500 - ₹1,000' },
    { min: '1000', max: '5000', label: '₹1,000 - ₹5,000' },
    { min: '5000', max: '10000', label: '₹5,000 - ₹10,000' },
    { min: '10000', max: '50000', label: '₹10,000 - ₹50,000' },
    { min: '50000', max: '', label: 'Above ₹50,000' },
  ];

  const activeCategory = categories.find((c) => c.slug === filters.category);

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-3">
      {/* Breadcrumb - matching Flipkart style */}
      <div className="text-xs text-gray-500 mb-2 px-1">
        <span className="hover:text-[#2874f0] cursor-pointer">Home</span>
        <span className="mx-1">&gt;</span>
        {activeCategory ? (
          <span className="text-gray-700 font-medium">{activeCategory.name}</span>
        ) : filters.search ? (
          <span className="text-gray-700">Search: &quot;{filters.search}&quot;</span>
        ) : (
          <span className="text-gray-700 font-medium">All Products</span>
        )}
      </div>

      <div className="flex gap-3">
        {/* Filters Sidebar - matching real Flipkart */}
        <aside className={`${showFilters ? 'fixed inset-0 z-40 bg-white overflow-y-auto' : 'hidden'} lg:block lg:static lg:w-[250px] shrink-0`}>
          <div className="bg-white rounded-sm shadow-sm">
            {/* Filters Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button className="lg:hidden" onClick={() => setShowFilters(false)}>
                <FiX size={20} />
              </button>
            </div>

            {/* Category Filter - Flipkart uses breadcrumb-style navigation */}
            <div className="border-b px-4 py-3">
              <button
                className="flex items-center justify-between w-full text-xs font-bold text-gray-900 uppercase tracking-wide mb-2"
                onClick={() => setExpandedFilter((p) => ({ ...p, category: !p.category }))}
              >
                Categories
                {expandedFilter.category ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {expandedFilter.category && (
                <div className="space-y-0.5">
                  {filters.category && (
                    <button
                      className="flex items-center gap-1 text-xs text-gray-500 mb-1 hover:text-[#2874f0]"
                      onClick={() => setFilters((p) => ({ ...p, category: '', page: 1 }))}
                    >
                      &lt; All Categories
                    </button>
                  )}
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`block text-sm w-full text-left py-1 pl-2 border-l-2 ${
                        filters.category === cat.slug
                          ? 'text-[#2874f0] font-semibold border-[#2874f0]'
                          : 'text-gray-600 border-transparent hover:text-[#2874f0]'
                      }`}
                      onClick={() => setFilters((p) => ({ ...p, category: cat.slug, page: 1 }))}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className="border-b px-4 py-3">
              <button
                className="flex items-center justify-between w-full text-xs font-bold text-gray-900 uppercase tracking-wide mb-2"
                onClick={() => setExpandedFilter((p) => ({ ...p, price: !p.price }))}
              >
                Price
                {expandedFilter.price ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {expandedFilter.price && (
                <div className="space-y-1">
                  {/* Price slider visual */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-[3px] bg-gray-200 rounded relative">
                      <div className="absolute left-0 top-0 h-full bg-[#2874f0] rounded" style={{ width: '40%' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <span className="border px-2 py-1 rounded text-xs">
                      Min
                    </span>
                    <span>to</span>
                    <span className="border px-2 py-1 rounded text-xs">
                      ₹{filters.max_price || '∞'}
                    </span>
                  </div>
                  {priceRanges.map((range) => {
                    const isActive = filters.min_price === range.min && filters.max_price === range.max;
                    return (
                      <label
                        key={range.label}
                        className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#2874f0] py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => {
                            if (isActive) {
                              setFilters((p) => ({ ...p, min_price: '', max_price: '', page: 1 }));
                            } else {
                              setFilters((p) => ({ ...p, min_price: range.min, max_price: range.max, page: 1 }));
                            }
                          }}
                          className="w-3.5 h-3.5 accent-[#2874f0]"
                        />
                        {range.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Ratings Filter - with checkboxes like real Flipkart */}
            <div className="border-b px-4 py-3">
              <button
                className="flex items-center justify-between w-full text-xs font-bold text-gray-900 uppercase tracking-wide mb-2"
                onClick={() => setExpandedFilter((p) => ({ ...p, rating: !p.rating }))}
              >
                Customer Ratings
                {expandedFilter.rating ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {expandedFilter.rating && (
                <div className="space-y-1">
                  {ratingOptions.map((opt) => {
                    const isActive = filters.min_rating === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#2874f0] py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => setFilters((p) => ({ ...p, min_rating: isActive ? '' : opt.value, page: 1 }))}
                          className="w-3.5 h-3.5 accent-[#2874f0]"
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Brand Filter - collapsed by default like Flipkart */}
            <div className="px-4 py-3">
              <button
                className="flex items-center justify-between w-full text-xs font-bold text-gray-900 uppercase tracking-wide mb-2"
                onClick={() => setExpandedFilter((p) => ({ ...p, brand: !p.brand }))}
              >
                Brand
                {expandedFilter.brand ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </button>
              {expandedFilter.brand && (
                <div className="space-y-1">
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search Brand"
                      className="w-full border rounded px-3 py-1.5 text-xs outline-none focus:border-[#2874f0]"
                    />
                  </div>
                  {['Apple', 'Samsung', 'OnePlus', 'Nike', 'Sony', 'LG', 'Philips', 'LEGO'].map((brand) => (
                    <label key={brand} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#2874f0] py-0.5">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-[#2874f0]" />
                      {brand}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header: Title + Count */}
          {activeCategory && (
            <div className="bg-white rounded-sm shadow-sm px-4 py-3 mb-2">
              <h1 className="text-lg font-semibold text-gray-900">
                {activeCategory.name}
              </h1>
              <p className="text-xs text-gray-500">
                {filters.search && <>Showing results for &quot;<strong>{filters.search}</strong>&quot; &mdash; </>}
                <span style={{ color: '#878787' }}>
                  (Showing 1 &ndash; {products.length} of {pagination?.total || 0} products)
                </span>
              </p>
            </div>
          )}

          {/* Sort Bar - matching Flipkart exactly */}
          <div className="bg-white rounded-sm shadow-sm p-3 mb-2 flex items-center justify-between flex-wrap gap-2 border-b-2 border-gray-100">
            <div className="flex items-center gap-2">
              <button
                className="lg:hidden flex items-center gap-1 text-sm text-[#2874f0] font-medium border border-[#2874f0] px-3 py-1.5 rounded"
                onClick={() => setShowFilters(true)}
              >
                <FiFilter size={14} /> Filters
              </button>
              {!activeCategory && (
                <span className="text-sm text-gray-600">
                  Showing <strong>{pagination?.total || 0}</strong> results
                  {filters.search && <span> for &quot;<strong>{filters.search}</strong>&quot;</span>}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
              <span className="text-sm font-semibold text-gray-800 px-3 py-1.5 whitespace-nowrap">Sort By</span>
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`text-sm px-3 py-1.5 whitespace-nowrap transition-colors ${
                    filters.sort === opt.value
                      ? 'text-[#2874f0] font-bold border-b-[3px] border-[#2874f0]'
                      : 'text-gray-600 hover:text-[#2874f0]'
                  }`}
                  onClick={() => setFilters((p) => ({ ...p, sort: opt.value }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-gray-200">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white p-4">
                  <div className="aspect-[3/4] skeleton mb-3" />
                  <div className="h-3 skeleton mb-2 w-3/4" />
                  <div className="h-3 skeleton mb-2 w-1/2" />
                  <div className="h-4 skeleton w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-sm shadow-sm p-16 text-center">
              <p className="text-6xl mb-4">🔍</p>
              <h3 className="text-lg font-medium text-gray-800 mb-1">No products found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              {/* Grid with 1px gap like Flipkart */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-gray-200 rounded-sm overflow-hidden shadow-sm">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-4 bg-white rounded-sm shadow-sm py-3">
                  <button
                    className="px-5 py-2 text-sm text-[#2874f0] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 rounded uppercase"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                  </span>
                  <button
                    className="px-5 py-2 text-sm text-[#2874f0] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-50 rounded uppercase"
                    disabled={filters.page >= pagination.totalPages}
                    onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2874f0]"></div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
