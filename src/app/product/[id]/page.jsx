'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsAPI, wishlistAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice, getDeliveryDate } from '@/lib/utils';
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
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getById(id);
        setProduct(res.data.product);
        setSimilarProducts(res.data.similarProducts || []);
        setSelectedImage(0);
        setAddedToCart(false);
        if (isAuthenticated) {
          try {
            const wishRes = await wishlistAPI.check(id);
            setInWishlist(wishRes.data.inWishlist);
          } catch {}
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
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); router.push('/login'); return; }
    setAddingToCart(true);
    const success = await addToCart(product.id);
    setAddingToCart(false);
    if (success) setAddedToCart(true);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (addedToCart) {
      router.push('/cart');
    } else {
      const success = await addToCart(product.id);
      if (success) router.push('/cart');
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login to use wishlist'); return; }
    try {
      if (inWishlist) { await wishlistAPI.remove(product.id); setInWishlist(false); toast.success('Removed from wishlist'); }
      else { await wishlistAPI.add(product.id); setInWishlist(true); toast.success('Added to wishlist!'); }
    } catch (error) { console.error('Wishlist error:', error); }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '16px', background: '#f1f3f6', minHeight: '80vh' }}>
        <div style={{ background: '#fff', display: 'flex', gap: 24, padding: 20 }}>
          <div style={{ width: '40%' }}><div style={{ paddingBottom: '100%', background: '#f5f5f5', borderRadius: 4 }} /></div>
          <div style={{ flex: 1 }}><div style={{ height: 24, background: '#f5f5f5', width: '70%', marginBottom: 12, borderRadius: 4 }} /><div style={{ height: 16, background: '#f5f5f5', width: '30%', marginBottom: 12, borderRadius: 4 }} /><div style={{ height: 32, background: '#f5f5f5', width: '40%', borderRadius: 4 }} /></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: 60, marginBottom: 12 }}>😕</p>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#212121' }}>Product not found</h2>
        <Link href="/products" style={{ color: '#2874f0', fontSize: 14, marginTop: 8, display: 'inline-block' }}>Browse all products</Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['https://placehold.co/400x400/f1f3f6/878787?text=No+Image'];
  const discountPercent = product.discount_percent || Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const specs = product.specifications || {};
  const rating = parseFloat(product.rating) || 0;
  const ratingBg = rating >= 4 ? '#388e3c' : rating >= 3 ? '#ff9f00' : '#ff6161';
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const deliveryDateStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh', paddingBottom: 70 }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '8px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: '#878787', padding: '8px 4px', marginBottom: 4 }}>
          <Link href="/" style={{ color: '#878787', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 4px' }}>&gt;</span>
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.slug}`} style={{ color: '#878787', textDecoration: 'none' }}>{product.category.name}</Link>
              <span style={{ margin: '0 4px' }}>&gt;</span>
            </>
          )}
          <span style={{ color: '#212121' }}>{product.name?.substring(0, 60)}...</span>
        </div>

        {/* Main Product Section */}
        <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start' }}>
          {/* Left Column: Images (sticky) */}
          <div style={{ width: 420, flexShrink: 0, position: 'sticky', top: 72, alignSelf: 'flex-start' }}>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0' }}>
              {/* Thumbnails on left + Main image */}
              <div style={{ display: 'flex', padding: '16px 8px' }}>
                {/* Thumbnail Column */}
                <div style={{ width: 64, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, marginRight: 8 }}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setSelectedImage(i)}
                      onClick={() => setSelectedImage(i)}
                      style={{
                        width: 56, height: 56, border: selectedImage === i ? '2px solid #2874f0' : '1px solid #e0e0e0',
                        borderRadius: 2, padding: 2, cursor: 'pointer', background: '#fff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <img src={img} alt={`view ${i + 1}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={e => { e.target.src = 'https://placehold.co/56x56/f1f3f6/878787?text=•'; }} />
                    </button>
                  ))}
                </div>

                {/* Main Image */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 350 }}>
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    style={{ maxWidth: '100%', maxHeight: 350, objectFit: 'contain' }}
                    onError={e => { e.target.src = 'https://placehold.co/400x400/f1f3f6/878787?text=No+Image'; }}
                  />
                  {/* Wishlist */}
                  <button onClick={toggleWishlist}
                    style={{
                      position: 'absolute', top: 4, right: 4, width: 36, height: 36, borderRadius: '50%',
                      border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.1)',
                    }}
                  >
                    <span style={{ fontSize: 18, color: inWishlist ? '#ff4081' : '#c2c2c2' }}>{inWishlist ? '♥' : '♡'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div style={{ flex: 1, paddingLeft: 16, minWidth: 0 }}>
            {/* Title & Rating Section */}
            <div style={{ background: '#fff', padding: '20px 24px', border: '1px solid #f0f0f0', marginBottom: 0 }}>
              {product.brand && (
                <p style={{ fontSize: 14, color: '#878787', marginBottom: 4 }}>{product.brand}</p>
              )}
              <h1 style={{ fontSize: 18, fontWeight: 400, color: '#212121', lineHeight: 1.4, marginBottom: 12 }} id="product-title">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                {rating > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3, background: ratingBg, color: '#fff',
                    padding: '2px 8px', borderRadius: 3, fontSize: 13, fontWeight: 700,
                  }}>
                    {rating.toFixed(1)} ★
                  </span>
                )}
                <span style={{ fontSize: 13, color: '#878787', fontWeight: 500 }}>
                  {product.review_count?.toLocaleString()} Ratings & Reviews
                </span>
              </div>

              {/* Price Section */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#212121' }}>{formatPrice(product.price)}</span>
                {parseFloat(product.mrp) > parseFloat(product.price) && (
                  <>
                    <span style={{ fontSize: 16, color: '#878787', textDecoration: 'line-through' }}>{formatPrice(product.mrp)}</span>
                    <span style={{ fontSize: 16, color: '#388e3c', fontWeight: 600 }}>{discountPercent}% off</span>
                  </>
                )}
              </div>
              <p style={{ fontSize: 12, color: '#878787', marginBottom: 4 }}>inclusive of all taxes</p>

              {/* EMI info */}
              {parseFloat(product.price) >= 3000 && (
                <p style={{ fontSize: 13, color: '#212121', marginTop: 8 }}>
                  Or Pay <span style={{ fontWeight: 600 }}>{formatPrice(Math.round(parseFloat(product.price) / 12))}</span>/month
                  <span style={{ color: '#878787' }}> • No Cost EMI available</span>
                </p>
              )}
            </div>

            {/* Delivery Details Section */}
            <div style={{ background: '#fff', padding: '16px 24px', border: '1px solid #f0f0f0', borderTop: 'none' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#212121', marginBottom: 14 }}>Delivery details</h3>

              {/* Delivery address */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: 16 }}>🏠</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#212121' }}>HOME</span>
                  <span style={{ fontSize: 13, color: '#212121', marginLeft: 6 }}>Your delivery address</span>
                </div>
                <span style={{ fontSize: 16, color: '#878787' }}>›</span>
              </div>

              {/* Delivery date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: 16 }}>📦</span>
                <div>
                  <span style={{ fontSize: 13, color: '#212121' }}>Delivery by </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#212121' }}>{deliveryDateStr}</span>
                  <span style={{ margin: '0 6px', color: '#e0e0e0' }}>|</span>
                  <span style={{ fontSize: 13, color: '#388e3c', fontWeight: 600 }}>
                    {parseFloat(product.price) >= 500 ? 'Free' : '₹40'}
                  </span>
                </div>
              </div>

              {/* Seller info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                <span style={{ fontSize: 16 }}>🏪</span>
                <div>
                  <span style={{ fontSize: 13, color: '#212121' }}>Sold by </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2874f0' }}>{product.brand || 'Flipkart'}Store</span>
                </div>
              </div>
            </div>

            {/* Highlights Row */}
            <div style={{ background: '#fff', padding: '16px 24px', border: '1px solid #f0f0f0', borderTop: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
                {[
                  { icon: '↩️', text: '10-Day', sub: 'Return' },
                  { icon: '💵', text: 'Cash on', sub: 'Delivery' },
                  { icon: '🛡️', text: 'Customer', sub: 'support' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '0 16px' }}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#212121' }}>{item.text}</span>
                    <span style={{ fontSize: 11, color: '#878787' }}>{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ background: '#fff', padding: '20px 24px', border: '1px solid #f0f0f0', marginTop: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#212121', marginBottom: 12 }}>Description</h3>
                <p style={{ fontSize: 14, color: '#212121', lineHeight: 1.7 }}>{product.description}</p>
              </div>
            )}

            {/* Specifications */}
            {Object.keys(specs).length > 0 && (
              <div style={{ background: '#fff', padding: '20px 24px', border: '1px solid #f0f0f0', marginTop: 8 }}>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: '#212121', marginBottom: 16 }}>Specifications</h3>
                <div>
                  {Object.entries(specs).map(([key, value], i) => (
                    <div key={key} style={{
                      display: 'flex', padding: '10px 0',
                      borderBottom: i < Object.entries(specs).length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}>
                      <span style={{ fontSize: 14, color: '#878787', width: 180, flexShrink: 0 }}>{key}</span>
                      <span style={{ fontSize: 14, color: '#212121' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Stock Warning */}
            {product.stock <= 5 && product.stock > 0 && (
              <div style={{ background: '#fff3e0', padding: '12px 24px', border: '1px solid #ffe0b2', marginTop: 8, borderRadius: 2 }}>
                <p style={{ fontSize: 13, color: '#e65100', fontWeight: 600 }}>⚠ Only {product.stock} left in stock - order soon!</p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div style={{ background: '#fff', marginTop: 8, padding: 16, border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#212121', marginBottom: 16 }}>Similar Products</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, background: '#f0f0f0' }}>
              {similarProducts.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar - Flipkart style */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff',
        borderTop: '1px solid #e0e0e0', boxShadow: '0 -2px 10px rgba(0,0,0,.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '10px 24px', zIndex: 50,
      }}>
        <div style={{ maxWidth: 1300, width: '100%', display: 'flex', margin: '0 auto', gap: 16, justifyContent: 'center' }}>
          {/* Add to Cart */}
          <button
            id="add-to-cart-btn"
            onClick={addedToCart ? () => router.push('/cart') : handleAddToCart}
            disabled={addingToCart || product.stock <= 0}
            style={{
              minWidth: 220, padding: '14px 40px',
              border: '1px solid #c2c2c2',
              borderRadius: 8,
              cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
              background: '#fff', color: '#212121', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: product.stock <= 0 ? 0.5 : 1,
              transition: 'all .15s',
            }}
          >
            {product.stock <= 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : addedToCart ? 'Go to cart' : 'Add to cart'}
          </button>

          {/* Buy at ₹X */}
          <button
            id="buy-now-btn"
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            style={{
              minWidth: 220, padding: '14px 40px',
              border: 'none',
              borderRadius: 8,
              cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
              background: '#ffc107', color: '#212121', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: product.stock <= 0 ? 0.5 : 1,
              transition: 'all .15s',
            }}
          >
            Buy at {formatPrice(product.price)}
          </button>
        </div>
      </div>
    </div>
  );
}

