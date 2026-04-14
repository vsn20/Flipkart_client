'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsAPI, wishlistAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice, getDeliveryDate } from '@/lib/utils';
import { FiStar, FiHeart, FiShoppingCart, FiZap, FiTruck, FiShield, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getById(id);
        setProduct(res.data.product);
        setSimilarProducts(res.data.similarProducts || []);
        setSelectedImage(0);

        // Check wishlist status
        if (isAuthenticated) {
          try {
            const wishRes = await wishlistAPI.check(id);
            setInWishlist(wishRes.data.inWishlist);
          } catch {} // eslint-disable-line
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }
    setAddingToCart(true);
    await addToCart(product.id);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const success = await addToCart(product.id);
    if (success) router.push('/cart');
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      return;
    }
    try {
      if (inWishlist) {
        await wishlistAPI.remove(product.id);
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(product.id);
        setInWishlist(true);
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="bg-white rounded-sm p-6 flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[40%]">
            <div className="aspect-square skeleton" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-6 skeleton w-3/4" />
            <div className="h-4 skeleton w-1/4" />
            <div className="h-8 skeleton w-1/3" />
            <div className="h-4 skeleton w-full" />
            <div className="h-4 skeleton w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">😕</p>
        <h2 className="text-xl font-medium text-gray-800">Product not found</h2>
        <Link href="/products" className="text-[#2874f0] text-sm mt-2 inline-block">Browse all products</Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/400x400?text=No+Image'];
  const discountPercent = product.discount_percent || Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const specs = product.specifications || {};

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-3">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-2 px-2">
        <Link href="/" className="hover:text-[#2874f0]">Home</Link> &gt;{' '}
        {product.category && <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#2874f0]">{product.category.name}</Link>} &gt;{' '}
        <span className="text-gray-700">{product.name?.substring(0, 40)}...</span>
      </div>

      <div className="bg-white rounded-sm shadow-sm">
        <div className="flex flex-col lg:flex-row">
          {/* Left: Image Section */}
          <div className="lg:w-[40%] p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="sticky top-[72px]">
              {/* Main Image */}
              <div className="relative aspect-square flex items-center justify-center mb-4 border border-gray-100 rounded overflow-hidden bg-white">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
                />

                {/* Wishlist button */}
                <button
                  className={`absolute top-3 right-3 w-10 h-10 rounded-full border shadow-sm flex items-center justify-center transition-all ${
                    inWishlist ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 hover:border-red-200'
                  }`}
                  onClick={toggleWishlist}
                >
                  <FiHeart size={18} className={inWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400'} fill={inWishlist ? 'currentColor' : 'none'} />
                </button>

                {/* Image nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white"
                      onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                    >
                      <FiChevronLeft size={18} />
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow hover:bg-white"
                      onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                    >
                      <FiChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`w-16 h-16 border rounded p-1 shrink-0 transition-all ${
                        selectedImage === i ? 'border-[#2874f0] shadow' : 'border-gray-200 hover:border-gray-400'
                      }`}
                      onMouseEnter={() => setSelectedImage(i)}
                      onClick={() => setSelectedImage(i)}
                    >
                      <img src={img} alt={`view ${i + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 btn-flipkart-yellow flex items-center justify-center gap-2 disabled:opacity-60"
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock <= 0}
                  id="add-to-cart-btn"
                >
                  <FiShoppingCart size={18} />
                  {product.stock <= 0 ? 'OUT OF STOCK' : addingToCart ? 'ADDING...' : 'ADD TO CART'}
                </button>
                <button
                  className="flex-1 btn-flipkart flex items-center justify-center gap-2"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  id="buy-now-btn"
                >
                  <FiZap size={18} />
                  BUY NOW
                </button>
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex-1 p-4 lg:p-6">
            {/* Brand & Name */}
            {product.brand && (
              <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
            )}
            <h1 className="text-lg font-normal text-gray-800 mb-2" id="product-title">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`rating-badge ${product.rating >= 4 ? '' : product.rating >= 3 ? 'medium' : 'low'}`}>
                {product.rating} <FiStar size={11} fill="white" />
              </span>
              <span className="text-sm text-gray-500 font-medium">
                {product.review_count?.toLocaleString()} Ratings & Reviews
              </span>
            </div>

            {/* Extra Offer Badge */}
            <p className="text-xs text-[#388e3c] font-semibold mb-3">Extra ₹{Math.round(product.mrp - product.price)} off</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-[28px] font-semibold text-gray-900">{formatPrice(product.price)}</span>
              {parseFloat(product.mrp) > parseFloat(product.price) && (
                <>
                  <span className="text-base text-gray-400 line-through">{formatPrice(product.mrp)}</span>
                  <span className="text-base text-[#388e3c] font-semibold">{discountPercent}% off</span>
                </>
              )}
            </div>

            {/* Tax info */}
            <p className="text-xs text-gray-500 mb-4">inclusive of all taxes</p>

            {/* Stock Status */}
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-sm text-[#ff6161] font-medium mb-3">Only {product.stock} left in stock - order soon!</p>
            )}

            {/* Highlights */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: <FiTruck size={20} />, text: 'Free Delivery', sub: parseFloat(product.price) >= 500 ? 'on this order' : 'on orders ₹500+' },
                  { icon: <FiRefreshCw size={20} />, text: '7 Day Return', sub: 'Easy returns' },
                  { icon: <FiShield size={20} />, text: 'Warranty', sub: '1 Year' },
                  { icon: <FiStar size={20} />, text: 'Top Brand', sub: product.brand || 'Trusted' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-1 text-gray-600">
                    <span className="text-[#2874f0]">{item.icon}</span>
                    <span className="text-xs font-medium">{item.text}</span>
                    <span className="text-[10px] text-gray-400">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex items-start gap-4">
                <span className="text-sm font-medium text-gray-500 w-28 shrink-0">Delivery</span>
                <div>
                  <p className="text-sm text-gray-800 font-medium">Delivery by {getDeliveryDate()}</p>
                  <p className="text-xs text-gray-500">{parseFloat(product.price) >= 500 ? 'Free' : '₹40'} | Free delivery on orders above ₹500</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-gray-100 pt-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div className="border-t border-gray-100 pt-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
                <div className="bg-gray-50 rounded overflow-hidden">
                  {Object.entries(specs).map(([key, value], i) => (
                    <div
                      key={key}
                      className={`flex ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}
                    >
                      <span className="text-sm text-gray-500 w-40 shrink-0 p-3 font-medium">{key}</span>
                      <span className="text-sm text-gray-800 p-3">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="bg-white rounded-sm shadow-sm mt-3 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Similar Products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {similarProducts.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
