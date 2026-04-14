'use client';
import Link from 'next/link';
import { FiHeart, FiStar } from 'react-icons/fi';
import { formatPrice, truncateText } from '@/lib/utils';

export default function ProductCard({ product }) {
  const discountPercent = product.discount_percent || Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const isBestseller = product.tags?.includes('bestseller');
  const isHotDeal = discountPercent >= 50;
  const isLowStock = product.stock <= 10;

  return (
    <Link
      href={`/product/${product.id}`}
      className="product-card block bg-white overflow-hidden group relative"
      id={`product-card-${product.id}`}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[3/4] flex items-center justify-center p-4 overflow-hidden">
        <img
          src={product.images?.[0] || 'https://placehold.co/280x280/f1f3f6/878787?text=No+Image'}
          alt={product.name}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/280x280/f1f3f6/878787?text=No+Image'; }}
        />

        {/* Wishlist Heart - always visible like real Flipkart */}
        <button
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <FiHeart size={16} className="text-gray-400 hover:text-red-500 transition-colors" />
        </button>

        {/* Bestseller Badge */}
        {isBestseller && (
          <span className="absolute top-2 left-0 bg-[#878787] text-white text-[10px] font-semibold px-2 py-0.5"
            style={{ borderRadius: '0 2px 2px 0' }}>
            Bestseller
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="px-3 pb-3 space-y-1">
        {/* Brand */}
        {product.brand && (
          <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{product.brand}</p>
        )}

        {/* Name */}
        <h3 className="text-[13px] text-gray-800 leading-tight line-clamp-2 min-h-[34px]">
          {truncateText(product.name, 55)}
        </h3>

        {/* Rating + Assured */}
        <div className="flex items-center gap-2 flex-wrap">
          {product.rating > 0 && (
            <span className={`rating-badge ${product.rating >= 4 ? '' : product.rating >= 3 ? 'medium' : 'low'}`}>
              {product.rating} <FiStar size={10} fill="white" />
            </span>
          )}
          {product.review_count > 0 && (
            <span className="text-xs text-gray-400">
              ({product.review_count?.toLocaleString()})
            </span>
          )}
          {/* Flipkart Assured badge */}
          {product.rating >= 4 && (
            <span className="flex items-center gap-0.5" title="Flipkart Assured">
              <svg width="53" height="16" viewBox="0 0 53 16" fill="none">
                <rect width="53" height="16" rx="2" fill="#2874f0"/>
                <text x="4" y="11.5" fill="white" fontSize="7" fontWeight="700" fontFamily="Arial">f</text>
                <text x="11" y="11.5" fill="#ffc200" fontSize="7.5" fontWeight="700" fontFamily="Arial">Assured</text>
              </svg>
            </span>
          )}
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[15px] font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {parseFloat(product.mrp) > parseFloat(product.price) && (
            <>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.mrp)}
              </span>
              <span className="text-xs text-[#388e3c] font-semibold">
                {discountPercent}% off
              </span>
            </>
          )}
        </div>

        {/* Hot Deal / Only Few Left */}
        {isHotDeal && (
          <span className="inline-block text-[10px] font-bold text-[#ff6161] border border-[#ff6161] px-1.5 py-0.5 rounded-sm">
            Hot Deal
          </span>
        )}
        {isLowStock && !isHotDeal && (
          <p className="text-[11px] text-[#ff6161] font-medium">Only few left</p>
        )}

        {/* Free Delivery */}
        {parseFloat(product.price) >= 500 && (
          <p className="text-[11px] text-gray-500">Free delivery</p>
        )}
      </div>
    </Link>
  );
}
