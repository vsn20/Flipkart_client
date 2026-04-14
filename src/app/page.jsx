'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const BANNERS = [
  {
    bg: 'linear-gradient(110deg,#1565c0 0%,#0d47a1 100%)',
    title: 'Mobiles Fest', subtitle: 'Up to 80% Off + Free Financing', tag: 'FREE FINANCING',
    img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&q=80',
  },
  {
    bg: 'linear-gradient(110deg,#e65100 0%,#bf360c 100%)',
    title: 'Fashion Fiesta', subtitle: 'Min 50% Off — Top Brands', tag: 'BIG SALE',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80',
  },
  {
    bg: 'linear-gradient(110deg,#2e7d32 0%,#1b5e20 100%)',
    title: 'Home & Kitchen', subtitle: 'Furniture & Decor from ₹199', tag: 'HOT DEALS',
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80',
  },
  {
    bg: 'linear-gradient(110deg,#6a1b9a 0%,#4a148c 100%)',
    title: 'Beauty Bonanza', subtitle: 'Premium Products at Best Prices', tag: 'EXCLUSIVE',
    img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80',
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(0);

  useEffect(() => {
    Promise.all([productsAPI.getFeatured(), categoriesAPI.getAll()])
      .then(([f, c]) => { setFeatured(f.data); setCategories(c.data.categories || []); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBanner(p => (p + 1) % BANNERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  if (loading) return <Skeleton/>;

  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div style={{ position: 'relative', height: 320, overflow: 'hidden', background: BANNERS[banner].bg }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ background: '#ffe500', color: '#212121', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 2, display: 'inline-block', marginBottom: 14, letterSpacing: 0.5 }}>
              {BANNERS[banner].tag}
            </div>
            <h2 style={{ color: '#fff', fontSize: 40, fontWeight: 800, lineHeight: 1.2, marginBottom: 10 }}>{BANNERS[banner].title}</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, marginBottom: 24 }}>{BANNERS[banner].subtitle}</p>
            <Link href="/products" style={{ background: '#fff', color: '#2874f0', padding: '12px 36px', borderRadius: 2, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block', letterSpacing: 0.3 }}>
              Shop Now
            </Link>
          </div>
          {BANNERS[banner].img && (
            <img src={BANNERS[banner].img} alt="" style={{ height: 260, objectFit: 'cover', borderRadius: 4, opacity: 0.9 }} onError={e => e.target.style.display='none'}/>
          )}
        </div>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setBanner(i)}
              style={{ width: i === banner ? 22 : 8, height: 8, borderRadius: 4, background: i === banner ? '#fff' : 'rgba(255,255,255,.5)', border: 'none', cursor: 'pointer', transition: 'width .3s, background .3s', padding: 0 }}/>
          ))}
        </div>

        {/* Arrows */}
        <button onClick={() => setBanner(p => (p - 1 + BANNERS.length) % BANNERS.length)}
          style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.9)', border: 'none', borderRadius: 1, padding: '12px 8px', cursor: 'pointer', fontSize: 16, color: '#212121', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}>‹</button>
        <button onClick={() => setBanner(p => (p + 1) % BANNERS.length)}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.9)', border: 'none', borderRadius: 1, padding: '12px 8px', cursor: 'pointer', fontSize: 16, color: '#212121', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}>›</button>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 8px' }}>
        {/* Category Row */}
        <div style={{ background: '#fff', margin: '8px 0', padding: '16px 8px', boxShadow: '0 2px 4px rgba(0,0,0,.07)', display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <Link key={cat.id} href={`/category/${cat.slug}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 88, textDecoration: 'none', cursor: 'pointer', padding: '0 10px', flexShrink: 0 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                <img src={cat.image_url || `https://placehold.co/64x64/f1f3f6/2874f0?text=${cat.name[0]}`} alt={cat.name}
                  style={{ width: 56, height: 56, objectFit: 'contain' }}
                  onError={e => e.target.src=`https://placehold.co/64x64/f1f3f6/2874f0?text=${cat.name[0]}`}/>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#212121', textAlign: 'center', lineHeight: 1.3 }}>{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* Deal of the Day */}
        {featured?.topDeals?.length > 0 && (
          <Section title="Deal of the Day" sub="Prices valid for limited time" link="/products" timer>
            {featured.topDeals.map(p => <ProductCard key={p.id} product={p}/>)}
          </Section>
        )}

        {/* Promo strip */}
        <div style={{ background: 'linear-gradient(90deg,#2874f0,#6C63FF)', padding: '20px 28px', margin: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Flipkart Plus</h3>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 13 }}>Earn SuperCoins on every purchase. Get exclusive deals & early access!</p>
          </div>
          <Link href="/flipkart-plus" style={{ background: '#fff', color: '#2874f0', padding: '10px 28px', borderRadius: 2, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Explore Plus
          </Link>
        </div>

        {/* Best of Electronics */}
        {featured?.featuredProducts?.length > 0 && (
          <Section title="Best of Electronics" sub="Top picks for you" link="/products?category=electronics">
            {featured.featuredProducts.map(p => <ProductCard key={p.id} product={p}/>)}
          </Section>
        )}

        {/* Top Rated */}
        {featured?.bestSellers?.length > 0 && (
          <Section title="Top Rated Products" sub="Based on customer reviews" link="/products">
            {featured.bestSellers.map(p => <ProductCard key={p.id} product={p}/>)}
          </Section>
        )}

        {/* Recently Added Grid */}
        {featured?.bestSellers?.length > 0 && (
          <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.07)', margin: '8px 0', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#212121' }}>Recently Added</h2>
              <Link href="/products" style={{ background: '#2874f0', color: '#fff', padding: '8px 24px', borderRadius: 2, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>VIEW ALL</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, background: '#f0f0f0' }}>
              {featured.bestSellers.slice(0, 12).map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DealTimer() {
  const [t, setT] = useState({ h: 11, m: 59, s: 59 });
  useEffect(() => {
    const iv = setInterval(() => setT(prev => {
      let { h, m, s } = prev;
      s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; m = 59; s = 59; }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(iv);
  }, []);
  const Box = ({ v }) => (
    <span style={{ background: '#212121', color: '#fff', fontSize: 13, fontWeight: 700, padding: '3px 7px', borderRadius: 2, fontVariantNumeric: 'tabular-nums' }}>{String(v).padStart(2,'0')}</span>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#878787' }}>
      <span>Ends in</span> <Box v={t.h}/> <span style={{ fontWeight: 700 }}>:</span> <Box v={t.m}/> <span style={{ fontWeight: 700 }}>:</span> <Box v={t.s}/>
    </div>
  );
}

function Section({ title, sub, link, children, timer }) {
  const [ref, setRef] = useState(null);
  const scroll = d => ref && ref.scrollBy({ left: d * 260, behavior: 'smooth' });
  const items = Array.isArray(children) ? children : [children];

  return (
    <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.07)', margin: '8px 0', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#212121', lineHeight: 1 }}>{title}</h2>
          {sub && <p style={{ fontSize: 12, color: '#878787', marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {timer && <DealTimer/>}
          <Link href={link || '/products'} style={{ background: '#2874f0', color: '#fff', padding: '8px 24px', borderRadius: 2, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>VIEW ALL</Link>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <button onClick={() => scroll(-1)} style={{ position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.2)', borderRadius: 2, padding: '20px 8px', cursor: 'pointer', zIndex: 2, fontSize: 18, color: '#212121' }}>‹</button>
        <div ref={setRef} style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', background: '#f0f0f0', gap: 1 }}>
          {items.map((child, i) => (
            <div key={i} style={{ minWidth: 180, maxWidth: 180, flexShrink: 0 }}>{child}</div>
          ))}
        </div>
        <button onClick={() => scroll(1)} style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.2)', borderRadius: 2, padding: '20px 8px', cursor: 'pointer', zIndex: 2, fontSize: 18, color: '#212121' }}>›</button>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ background: '#f1f3f6', minHeight: '100vh' }}>
      <div style={{ height: 320, background: 'linear-gradient(90deg,#e8e8e8 25%,#f0f0f0 50%,#e8e8e8 75%)', backgroundSize: '200%', animation: 'shimmer 1.5s infinite' }}/>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '8px' }}>
        <div style={{ background: '#fff', height: 100, margin: '8px 0' }}/>
        <div style={{ background: '#fff', height: 280, margin: '8px 0' }}/>
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
    </div>
  );
}
