'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { wishlistAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { FiTrash2, FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistAPI.get();
      setWishlist(res.data.wishlist);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleMoveToCart = async (productId) => {
    const success = await addToCart(productId);
    if (success) {
      await wishlistAPI.remove(productId);
      fetchWishlist();
    }
  };

  if (!isAuthenticated) return null;

  const items = wishlist?.items || [];

  return (
    <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-3">
      <div className="bg-white rounded-sm shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-lg font-medium">My Wishlist ({items.length})</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded p-4">
                <div className="aspect-square skeleton mb-3" />
                <div className="h-3 skeleton mb-2" />
                <div className="h-4 skeleton w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-gray-500 mb-6">Save items you love for later</p>
            <Link
              href="/products"
              className="bg-[#2874f0] text-white px-10 py-3 rounded-sm text-sm font-semibold inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 divide-x divide-y">
            {items.map((item) => (
              <div key={item.id} className="p-4 hover:shadow-md transition-shadow relative group">
                {/* Remove button */}
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10"
                  onClick={() => handleRemove(item.product?.id)}
                >
                  <FiTrash2 size={16} />
                </button>

                <Link href={`/product/${item.product?.id}`}>
                  <div className="aspect-square flex items-center justify-center mb-3">
                    <img
                      src={item.product?.images?.[0] || 'https://via.placeholder.com/200'}
                      alt={item.product?.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="text-sm text-gray-800 line-clamp-2 mb-1">{item.product?.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-sm font-semibold">{formatPrice(item.product?.price)}</span>
                    {parseFloat(item.product?.mrp) > parseFloat(item.product?.price) && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(item.product?.mrp)}</span>
                    )}
                  </div>
                </Link>
                <button
                  className="w-full border border-[#2874f0] text-[#2874f0] py-2 rounded-sm text-xs font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
                  onClick={() => handleMoveToCart(item.product?.id)}
                >
                  <FiShoppingCart size={14} /> Move to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
