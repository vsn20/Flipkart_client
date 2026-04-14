'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiTag } from 'react-icons/fi';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, summary, loading, updateQuantity, removeFromCart, fetchCart } = useCart();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetchCart();
  }, []);

  if (!isAuthenticated) return null;

  const items = cart?.items || [];

  if (!loading && items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="bg-white rounded-sm shadow-sm p-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Your cart is empty!</h2>
          <p className="text-sm text-gray-500 mb-6">Add items to it now.</p>
          <Link
            href="/products"
            className="bg-[#2874f0] text-white px-10 py-3 rounded-sm text-sm font-semibold hover:bg-[#1a5dc8] transition-colors inline-block"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-3">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="bg-white rounded-sm shadow-sm">
            <div className="p-4 border-b">
              <h1 className="text-lg font-medium">My Cart ({summary?.itemCount || 0})</h1>
            </div>

            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 border-b pb-4">
                    <div className="w-28 h-28 skeleton shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton w-3/4" />
                      <div className="h-4 skeleton w-1/3" />
                      <div className="h-3 skeleton w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    {/* Product Image */}
                    <Link href={`/product/${item.product?.id}`} className="w-28 h-28 shrink-0 flex items-center justify-center">
                      <img
                        src={item.product?.images?.[0] || 'https://via.placeholder.com/112'}
                        alt={item.product?.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </Link>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.product?.id}`}>
                        <h3 className="text-sm text-gray-800 mb-1 line-clamp-2 hover:text-[#2874f0]">{item.product?.name}</h3>
                      </Link>
                      {item.product?.brand && (
                        <p className="text-xs text-gray-400 mb-2">Seller: {item.product.brand}Store</p>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-semibold text-gray-900">{formatPrice(item.product?.price)}</span>
                        {parseFloat(item.product?.mrp) > parseFloat(item.product?.price) && (
                          <>
                            <span className="text-xs text-gray-400 line-through">{formatPrice(item.product?.mrp)}</span>
                            <span className="text-xs text-[#388e3c] font-medium">{item.product?.discount_percent}% off</span>
                          </>
                        )}
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center gap-4">
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-medium border border-gray-200 rounded py-1">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.product?.stock || 10)}
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          className="text-sm font-semibold text-gray-600 hover:text-[#2874f0] uppercase transition-colors"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Place Order Button (mobile) */}
            <div className="p-4 flex justify-end lg:hidden">
              <button
                className="btn-flipkart w-full sm:w-auto"
                onClick={() => router.push('/checkout')}
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>

        {/* Price Summary Sidebar */}
        <div className="lg:w-[380px] shrink-0">
          <div className="bg-white rounded-sm shadow-sm sticky top-[72px]">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Price Details</h3>
            </div>

            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Price ({summary?.itemCount} items)</span>
                <span className="text-gray-800">{formatPrice(summary?.totalMRP)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Discount</span>
                <span className="text-[#388e3c] font-medium">−{formatPrice(summary?.totalDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Delivery Charges</span>
                <span className={parseFloat(summary?.deliveryCharges) === 0 ? 'text-[#388e3c] font-medium' : 'text-gray-800'}>
                  {parseFloat(summary?.deliveryCharges) === 0 ? 'FREE' : formatPrice(summary?.deliveryCharges)}
                </span>
              </div>

              <div className="border-t border-dashed pt-3 flex justify-between font-semibold text-base">
                <span className="text-gray-800">Total Amount</span>
                <span className="text-gray-900">{formatPrice(summary?.totalAmount)}</span>
              </div>

              <p className="text-[#388e3c] text-sm font-semibold pt-1">
                You will save {formatPrice(summary?.totalDiscount)} on this order
              </p>
            </div>

            <div className="p-4 border-t hidden lg:block">
              <button
                className="btn-flipkart w-full"
                onClick={() => router.push('/checkout')}
                id="place-order-btn"
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
