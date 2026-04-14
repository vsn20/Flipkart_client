'use client';
import Link from 'next/link';
import { formatPrice, truncateText } from '@/lib/utils';

export default function ProductCard({ product }) {
  const discPct = product.discount_percent || Math.round(((parseFloat(product.mrp) - parseFloat(product.price)) / parseFloat(product.mrp)) * 100) || 0;
  const isBestseller = product.tags?.includes('bestseller');
  const isHotDeal = discPct >= 50;
  const isLowStock = product.stock <= 10;
  const rating = parseFloat(product.rating) || 0;

  const ratingBg = rating >= 4 ? '#388e3c' : rating >= 3 ? '#ff9f00' : '#ff6161';

  return (
    <Link href={`/product/${product.id}`}
      style={{ display: 'block', background: '#fff', textDecoration: 'none', position: 'relative', cursor: 'pointer', padding: '10px 12px', transition: 'box-shadow .2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.15)'; e.currentTarget.style.zIndex = 2; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.zIndex = 1; }}
    >
      {/* Wishlist */}
      <button onClick={e => { e.preventDefault(); e.stopPropagation(); }}
        style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer', zIndex: 2, fontSize: 18, color: '#ccc', lineHeight: 1 }}
        onMouseEnter={e => e.currentTarget.style.color = '#ff4081'}
        onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
      >
        ♡
      </button>

      {/* Badges */}
      {isBestseller && (
        <div style={{ position: 'absolute', top: 10, left: 0, background: '#878787', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px 2px 8px', borderRadius: '0 2px 2px 0', letterSpacing: 0.3, zIndex: 2 }}>
          Bestseller
        </div>
      )}

      {/* Image */}
      <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', marginBottom: 8 }}>
        <img
          src={product.images?.[0] || 'https://placehold.co/200x200/f1f3f6/878787?text=No+Image'}
          alt={product.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', transition: 'transform .3s' }}
          loading="lazy"
          onError={e => { e.target.src = 'https://placehold.co/200x200/f1f3f6/878787?text=No+Image'; }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
      </div>

      {/* Brand */}
      {product.brand && (
        <p style={{ fontSize: 11, color: '#878787', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>
          {product.brand}
        </p>
      )}

      {/* Name */}
      <p style={{ fontSize: 13, color: '#212121', lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 36 }}>
        {product.name}
      </p>

      {/* Rating + Assured */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
        {rating > 0 && (
          <span style={{ background: ratingBg, color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 5px', borderRadius: 3, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {rating.toFixed(1)} ★
          </span>
        )}
        {product.review_count > 0 && (
          <span style={{ fontSize: 11, color: '#878787' }}>({product.review_count.toLocaleString('en-IN')})</span>
        )}
        {/* Flipkart Assured */}
        {rating >= 4 && (
          <svg width="55" height="15" viewBox="0 0 55 15">
            <rect width="55" height="15" rx="2" fill="#2874f0"/>
            <text x="4" y="11" fill="white" fontSize="8" fontWeight="700" fontFamily="Arial">f</text>
            <text x="12" y="11" fill="#ffe500" fontSize="7.5" fontWeight="700" fontFamily="Arial">Assured</text>
          </svg>
        )}
      </div>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#212121' }}>{formatPrice(product.price)}</span>
        {parseFloat(product.mrp) > parseFloat(product.price) && (
          <>
            <span style={{ fontSize: 12, color: '#878787', textDecoration: 'line-through' }}>{formatPrice(product.mrp)}</span>
            <span style={{ fontSize: 12, color: '#388e3c', fontWeight: 600 }}>{discPct}% off</span>
          </>
        )}
      </div>

      {/* Extra tags */}
      {isHotDeal && (
        <span style={{ fontSize: 10, fontWeight: 700, color: '#ff6161', border: '1px solid #ff6161', padding: '1px 5px', borderRadius: 2, display: 'inline-block', marginTop: 2 }}>
          Hot Deal
        </span>
      )}
      {isLowStock && !isHotDeal && (
        <p style={{ fontSize: 11, color: '#ff6161', fontWeight: 500, marginTop: 2 }}>Only few left</p>
      )}
      {parseFloat(product.price) >= 499 && (
        <p style={{ fontSize: 11, color: '#878787', marginTop: 2 }}>Free delivery</p>
      )}
    </Link>
  );
}
