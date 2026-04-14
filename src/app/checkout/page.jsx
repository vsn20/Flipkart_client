'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ordersAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { FiMapPin, FiCheck, FiCreditCard, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart, summary, fetchCart } = useCart();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState({
    shipping_name: user?.name || '',
    shipping_phone: user?.phone || '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetchCart();
  }, []);

  const items = cart?.items || [];

  if (!isAuthenticated) return null;
  if (items.length === 0 && !placing) {
    router.push('/cart');
    return null;
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const res = await ordersAPI.place({
        ...address,
        payment_method: paymentMethod,
      });
      toast.success('Order placed successfully! 🎉');
      router.push(`/order-confirmation/${res.data.order.id}`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to place order';
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  const steps = [
    { num: 1, label: 'Delivery Address', icon: <FiMapPin size={16} /> },
    { num: 2, label: 'Order Summary', icon: <FiPackage size={16} /> },
    { num: 3, label: 'Payment', icon: <FiCreditCard size={16} /> },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-2 sm:px-4 py-3">
      {/* Step Indicator */}
      <div className="bg-white rounded-sm shadow-sm p-4 mb-3">
        <div className="flex items-center justify-center gap-0">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-sm ${
                step >= s.num ? 'text-[#2874f0]' : 'text-gray-400'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > s.num ? 'bg-[#2874f0] text-white' : step === s.num ? 'bg-[#2874f0] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.num ? <FiCheck size={14} /> : s.num}
                </span>
                <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 ${step > s.num ? 'bg-[#2874f0]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        {/* Main Content */}
        <div className="flex-1">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white rounded-sm shadow-sm">
              <div className="p-4 border-b bg-[#2874f0] text-white rounded-t-sm">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-5 h-5 bg-white text-[#2874f0] rounded-sm flex items-center justify-center text-xs font-bold">1</span>
                  DELIVERY ADDRESS
                </h2>
              </div>
              <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Full Name *</label>
                    <input
                      type="text"
                      value={address.shipping_name}
                      onChange={(e) => setAddress({ ...address, shipping_name: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:border-[#2874f0] outline-none"
                      id="address-name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Phone Number *</label>
                    <input
                      type="tel"
                      value={address.shipping_phone}
                      onChange={(e) => setAddress({ ...address, shipping_phone: e.target.value })}
                      required
                      pattern="[0-9]{10}"
                      title="Enter 10-digit phone number"
                      className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:border-[#2874f0] outline-none"
                      id="address-phone"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Address (Area & Street) *</label>
                  <textarea
                    value={address.shipping_address}
                    onChange={(e) => setAddress({ ...address, shipping_address: e.target.value })}
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:border-[#2874f0] outline-none resize-none"
                    id="address-street"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">City/Town *</label>
                    <input
                      type="text"
                      value={address.shipping_city}
                      onChange={(e) => setAddress({ ...address, shipping_city: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:border-[#2874f0] outline-none"
                      id="address-city"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">State *</label>
                    <select
                      value={address.shipping_state}
                      onChange={(e) => setAddress({ ...address, shipping_state: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:border-[#2874f0] outline-none bg-white"
                      id="address-state"
                    >
                      <option value="">Select State</option>
                      {['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Pincode *</label>
                    <input
                      type="text"
                      value={address.shipping_pincode}
                      onChange={(e) => setAddress({ ...address, shipping_pincode: e.target.value })}
                      required
                      pattern="[0-9]{6}"
                      title="Enter 6-digit pincode"
                      className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm focus:border-[#2874f0] outline-none"
                      id="address-pincode"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-flipkart w-full sm:w-auto"
                  id="save-address-btn"
                >
                  SAVE AND DELIVER HERE
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Order Summary */}
          {step === 2 && (
            <div className="bg-white rounded-sm shadow-sm">
              <div className="p-4 border-b bg-[#2874f0] text-white rounded-t-sm">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-5 h-5 bg-white text-[#2874f0] rounded-sm flex items-center justify-center text-xs font-bold">2</span>
                  ORDER SUMMARY
                </h2>
              </div>
              <div className="p-4">
                {/* Delivery Address Preview */}
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                  <p className="font-medium text-gray-800">{address.shipping_name}</p>
                  <p className="text-gray-600">{address.shipping_address}</p>
                  <p className="text-gray-600">{address.shipping_city}, {address.shipping_state} - {address.shipping_pincode}</p>
                  <p className="text-gray-600">Phone: {address.shipping_phone}</p>
                  <button className="text-[#2874f0] text-xs font-medium mt-1" onClick={() => setStep(1)}>Change</button>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 py-2 border-b border-gray-100">
                      <img
                        src={item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                        alt={item.product?.name}
                        className="w-16 h-16 object-contain"
                      />
                      <div className="flex-1 text-sm">
                        <p className="text-gray-800 line-clamp-1">{item.product?.name}</p>
                        <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                        <p className="font-semibold text-gray-900">{formatPrice(item.product?.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="btn-flipkart w-full sm:w-auto mt-4"
                  onClick={() => setStep(3)}
                >
                  CONTINUE
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="bg-white rounded-sm shadow-sm">
              <div className="p-4 border-b bg-[#2874f0] text-white rounded-t-sm">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-5 h-5 bg-white text-[#2874f0] rounded-sm flex items-center justify-center text-xs font-bold">3</span>
                  PAYMENT OPTIONS
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* COD */}
                <label className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#2874f0] bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-0.5 accent-[#2874f0]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Cash on Delivery</p>
                    <p className="text-xs text-gray-500 mt-1">Pay when your order is delivered</p>
                  </div>
                </label>

                {/* UPI */}
                <label className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-[#2874f0] bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="mt-0.5 accent-[#2874f0]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">UPI</p>
                    <p className="text-xs text-gray-500 mt-1">Pay using Google Pay, PhonePe, or any UPI app</p>
                    {paymentMethod === 'UPI' && (
                      <div className="mt-3 p-3 bg-white border border-gray-200 rounded">
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center text-3xl">
                            📱
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-medium">Scan QR code or enter UPI ID</p>
                            <input
                              type="text"
                              placeholder="yourname@upi"
                              className="mt-2 border border-gray-300 rounded px-3 py-1.5 text-sm w-full max-w-[200px]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                <button
                  className="btn-flipkart w-full"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  id="confirm-order-btn"
                >
                  {placing ? 'Placing Order...' : `PLACE ORDER  •  ${formatPrice(summary?.totalAmount)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="lg:w-[320px] shrink-0">
          <div className="bg-white rounded-sm shadow-sm sticky top-[72px]">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">Price Details</h3>
            </div>
            <div className="p-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Price ({summary?.itemCount} items)</span>
                <span>{formatPrice(summary?.totalMRP)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Discount</span>
                <span className="text-[#388e3c]">−{formatPrice(summary?.totalDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Delivery Charges</span>
                <span className={parseFloat(summary?.deliveryCharges) === 0 ? 'text-[#388e3c]' : ''}>
                  {parseFloat(summary?.deliveryCharges) === 0 ? 'FREE' : formatPrice(summary?.deliveryCharges)}
                </span>
              </div>
              <div className="border-t border-dashed pt-2.5 flex justify-between font-semibold text-base">
                <span>Total Payable</span>
                <span>{formatPrice(summary?.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
