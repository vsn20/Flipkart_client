import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#172337] text-white mt-8">
      {/* Top Section */}
      <div className="max-w-[1400px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* About */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">About</h4>
            <ul className="space-y-2">
              {['Contact Us', 'About Us', 'Careers', 'Flipkart Stories', 'Press', 'Corporate Information'].map((item) => (
                <li key={item}>
                  <span className="text-xs text-gray-300 hover:text-white cursor-pointer transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Group Companies */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Group Companies</h4>
            <ul className="space-y-2">
              {['Myntra', 'Cleartrip', 'Shopsy'].map((item) => (
                <li key={item}>
                  <span className="text-xs text-gray-300 hover:text-white cursor-pointer transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Help</h4>
            <ul className="space-y-2">
              {['Payments', 'Shipping', 'Cancellation & Returns', 'FAQ', 'Report Infringement'].map((item) => (
                <li key={item}>
                  <span className="text-xs text-gray-300 hover:text-white cursor-pointer transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Consumer Policy */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Consumer Policy</h4>
            <ul className="space-y-2">
              {['Cancellation & Returns', 'Terms Of Use', 'Security', 'Privacy', 'Sitemap', 'Grievance Redressal', 'EPR Compliance'].map((item) => (
                <li key={item}>
                  <span className="text-xs text-gray-300 hover:text-white cursor-pointer transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mail Us */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Mail Us:</h4>
            <p className="text-xs text-gray-300 leading-5">
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India
            </p>
          </div>

          {/* Registered Office */}
          <div>
            <h4 className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Registered Office Address:</h4>
            <p className="text-xs text-gray-300 leading-5">
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India<br />
              CIN: U51109KA2012PTC066107<br />
              Telephone: 044-45614700
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              {[
                { icon: '🏪', text: 'Become a Seller' },
                { icon: '📢', text: 'Advertise' },
                { icon: '🎁', text: 'Gift Cards' },
                { icon: '❓', text: 'Help Center' },
              ].map((item) => (
                <span key={item.text} className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white cursor-pointer transition-colors">
                  <span>{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">© 2024 Flipkart Clone. Built for educational purposes.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
