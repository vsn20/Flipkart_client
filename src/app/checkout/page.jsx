'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ordersAPI, addressAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart, summary, fetchCart } = useCart();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated, router]);
  useEffect(() => { fetchCart(); }, []);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await addressAPI.getAll();
        const addrs = res.data.addresses || [];
        setAddresses(addrs);
        const def = addrs.find(a => a.is_default) || addrs[0];
        if (def) setSelectedAddressId(def.id);
      } catch (err) {
        console.error('Failed to load addresses:', err);
        toast.error('Failed to load addresses');
      } finally {
        setLoadingAddresses(false);
      }
    };
    loadAddresses();
  }, []);

  if (!isAuthenticated) return null;

  const items = cart?.items || [];
  if (items.length === 0 && !placing) { router.push('/cart'); return null; }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const mrp = parseFloat(summary?.totalMRP) || 0;
  const discount = parseFloat(summary?.totalDiscount) || 0;
  const delivery = parseFloat(summary?.deliveryCharges) || 0;
  const total = parseFloat(summary?.totalAmount) || 0;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error('Please select a delivery address'); return; }
    setPlacing(true);
    try {
      const addr = selectedAddress;
      const res = await ordersAPI.place({
        shipping_name: addr.name,
        shipping_phone: addr.phone,
        shipping_address: addr.address,
        shipping_city: addr.city,
        shipping_state: addr.state,
        shipping_pincode: addr.pincode,
        payment_method: paymentMethod
      });
      toast.success('Order placed successfully! 🎉');
      router.push(`/order-confirmation/${res.data.order.id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  const steps = [
    { num: 1, label: 'DELIVERY ADDRESS' },
    { num: 2, label: 'ORDER SUMMARY' },
    { num: 3, label: 'PAYMENT' },
  ];

  return (
    <div style={{ background: '#f1f3f6', minHeight: '80vh', padding: '12px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 12px', display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 320 }}>

          {/* Step Indicator – Flipkart-style */}
          <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)', marginBottom: 8, display: 'flex', overflow: 'hidden' }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '14px 16px', borderRight: i < steps.length - 1 ? '1px solid #f0f0f0' : 'none', background: step === s.num ? '#2874f0' : step > s.num ? '#fff' : '#fff', cursor: step > s.num ? 'pointer' : 'default' }}
                onClick={() => step > s.num && setStep(s.num)}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: step === s.num ? '#fff' : step > s.num ? '#2874f0' : '#e0e0e0', color: step === s.num ? '#2874f0' : step > s.num ? '#fff' : '#878787', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginRight: 10, flexShrink: 0 }}>
                  {step > s.num ? '✓' : s.num}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: step === s.num ? '#fff' : step > s.num ? '#2874f0' : '#878787', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
              <div style={{ padding: '20px 24px' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#212121', marginBottom: 16 }}>Select Delivery Address</h3>

                {loadingAddresses ? (
                  <div style={{ padding: '30px 0', textAlign: 'center', color: '#878787' }}>Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  <div style={{ padding: '30px 0', textAlign: 'center' }}>
                    <p style={{ color: '#878787', marginBottom: 16 }}>No saved addresses found</p>
                    <Link href="/account/addresses" style={{ background: '#2874f0', color: '#fff', padding: '10px 24px', borderRadius: 2, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                      Add New Address
                    </Link>
                  </div>
                ) : (
                  <>
                    {addresses.map(addr => (
                      <label key={addr.id} style={{
                        display: 'flex', gap: 12, padding: '14px 16px', marginBottom: 8, cursor: 'pointer',
                        border: selectedAddressId === addr.id ? '2px solid #2874f0' : '1px solid #e0e0e0',
                        borderRadius: 4, background: selectedAddressId === addr.id ? '#f5f9ff' : '#fff',
                        alignItems: 'flex-start'
                      }}>
                        <input type="radio" name="delivery-address" checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          style={{ accentColor: '#2874f0', width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#212121' }}>{addr.name}, {addr.pincode}</span>
                            <span style={{ fontSize: 10, background: '#e8e8e8', color: '#212121', padding: '2px 6px', borderRadius: 2, fontWeight: 700 }}>
                              {addr.address_type?.toUpperCase() || 'HOME'}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: '#878787', lineHeight: 1.5 }}>
                            {addr.address}, {addr.locality}, {addr.city}, {addr.state}
                          </p>
                        </div>
                      </label>
                    ))}
                    <button onClick={() => setStep(2)} disabled={!selectedAddressId}
                      style={{
                        background: selectedAddressId ? '#fb641b' : '#ccc', color: '#fff', border: 'none', borderRadius: 2,
                        padding: '14px 40px', fontSize: 14, fontWeight: 700, cursor: selectedAddressId ? 'pointer' : 'not-allowed',
                        letterSpacing: 0.5, textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(0,0,0,.2)', marginTop: 16
                      }}>
                      Continue
                    </button>
                    <Link href="/account/addresses" style={{
                      background: 'none', color: '#2874f0', border: '1px solid #2874f0', borderRadius: 2,
                      padding: '14px 40px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5,
                      textTransform: 'uppercase', marginLeft: 12, display: 'inline-block', textDecoration: 'none'
                    }}>
                      Add New Address
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#212121' }}>Deliver to: </span>
                    <span style={{ fontSize: 14, color: '#212121' }}>{selectedAddress?.name}, {selectedAddress?.pincode}</span>
                    <span style={{ marginLeft: 8, fontSize: 11, background: '#e0e0e0', padding: '2px 6px', borderRadius: 2, fontWeight: 600 }}>{selectedAddress?.address_type?.toUpperCase() || 'HOME'}</span>
                    <p style={{ fontSize: 13, color: '#878787', marginTop: 4 }}>{selectedAddress?.address}, {selectedAddress?.locality}, {selectedAddress?.city}</p>
                  </div>
                  <button onClick={() => setStep(1)} style={{ fontSize: 14, color: '#2874f0', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Change</button>
                </div>
              </div>
              <div style={{ padding: '12px 0' }}>
                {items.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 20px', borderBottom: i < items.length-1 ? '1px solid #f8f8f8' : 'none' }}>
                    <img src={item.product?.images?.[0] || ''} alt={item.product?.name} style={{ width: 60, height: 60, objectFit: 'contain', flexShrink: 0 }}/>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, color: '#212121', marginBottom: 4 }}>{item.product?.name}</p>
                      <p style={{ fontSize: 12, color: '#878787' }}>Qty: {item.quantity}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#212121', marginTop: 4 }}>{formatPrice(parseFloat(item.product?.price) * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '16px 20px' }}>
                <button onClick={() => setStep(3)} style={{ background: '#fb641b', color: '#fff', border: 'none', borderRadius: 2, padding: '14px 40px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5, textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(0,0,0,.2)' }}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)' }}>
              <div style={{ padding: '16px 20px' }}>
                {[
                  { id: 'COD', title: 'Cash on Delivery', sub: 'Pay when your order is delivered to your doorstep.' },
                  { id: 'UPI', title: 'UPI', sub: 'Pay using Google Pay, PhonePe, Paytm or any UPI app.' },
                  { id: 'CARD', title: 'Credit / Debit / ATM Card', sub: 'Add and secure cards as per your convenience.' },
                  { id: 'NB', title: 'Net Banking', sub: 'This instrument has low success, use UPI or cards.' },
                ].map(opt => (
                  <label key={opt.id} onClick={() => setPaymentMethod(opt.id)}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 2, marginBottom: 6, cursor: 'pointer', border: paymentMethod === opt.id ? '1px solid #2874f0' : '1px solid #e0e0e0', background: paymentMethod === opt.id ? '#f5f9ff' : '#fff' }}>
                    <input type="radio" name="pay" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} style={{ accentColor: '#2874f0', marginTop: 3 }}/>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#212121', marginBottom: 3 }}>{opt.title}</p>
                      <p style={{ fontSize: 13, color: '#878787' }}>{opt.sub}</p>
                    </div>
                  </label>
                ))}
                <button onClick={handlePlaceOrder} disabled={placing}
                  style={{ background: '#fb641b', color: '#fff', border: 'none', borderRadius: 2, padding: '14px 40px', fontSize: 14, fontWeight: 700, cursor: placing ? 'not-allowed' : 'pointer', letterSpacing: 0.5, textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(0,0,0,.2)', marginTop: 8, opacity: placing ? 0.7 : 1 }}>
                  {placing ? 'Placing Order...' : `Place Order  •  ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div style={{ width: 300, flexShrink: 0 }}>
          <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)', position: 'sticky', top: 60 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#878787', letterSpacing: 0.5, textTransform: 'uppercase' }}>Price Details</h3>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {[
                { l: `Price (${summary?.itemCount || 0} items)`, v: formatPrice(mrp), s: {} },
                { l: 'Discount', v: `−${formatPrice(discount)}`, s: { color: '#388e3c' } },
                { l: 'Delivery Charges', v: delivery === 0 ? 'FREE' : formatPrice(delivery), s: delivery === 0 ? { color: '#388e3c' } : {} },
                { l: 'Secured Packaging Fee', v: formatPrice(7), s: {} },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15 }}>
                  <span style={{ color: '#212121' }}>{r.l}</span>
                  <span style={r.s}>{r.v}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed #e0e0e0', margin: '12px 0 14px' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: '#212121', marginBottom: 12 }}>
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
              {discount > 0 && (
                <div style={{ background: '#f0faf0', borderRadius: 2, padding: '8px 12px', fontSize: 13, color: '#388e3c', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>
                  🎉 You will save {formatPrice(discount)} on this order!
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, borderTop: '1px solid #f0f0f0', paddingTop: 12, marginTop: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2874f0" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span style={{ fontSize: 12, color: '#878787', lineHeight: 1.5 }}>Safe and secure payments. Easy returns. 100% Authentic products.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', border: '1px solid #c2c2c2', borderRadius: 2, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, color: '#878787', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}
