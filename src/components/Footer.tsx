import React from 'react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-[#601131] text-white relative">
      {/* Torn paper effect at top */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-[#F5F5DC] transform -skew-y-1 origin-top-left"></div>
      
      <div className="pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <div className="text-white font-bold text-xl">
                  <span className="text-orange-400">Ty</span>
                  <br />
                  <span className="text-sm">MALABAR</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-4">Connect with Ty Malabar</h3>
              <p className="text-sm text-gray-300 mb-4">
                Delicious Indian cuisine delivered fresh to your doorstep. Explore our menu and order online for a seamless experience.
              </p>
              <div className="mb-4">
                <p className="text-sm text-gray-300">Powered by</p>
                <div className="flex items-center mt-2">
                  <span className="text-blue-400 font-semibold">ShopCube</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-orange-300 transition-colors">Home</a></li>
                <li><a href="/menu" className="text-gray-300 hover:text-orange-300 transition-colors">Menu</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-orange-300 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Best Menu */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Best Menu</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Homestyle Chicken Curry</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Onion Bhoji</p>
                    <p className="text-xs text-gray-400">Contains veg</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-400 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Cheese Nan</p>
                    <p className="text-xs text-gray-400">Contains gluten</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-sm text-gray-300 mb-2">
                8 Hendre Road, Pencoed, Bridgend, CF35 5NW
              </p>
              <p className="text-sm mb-4">
                <a href="tel:+1656860844" className="text-orange-300 hover:text-orange-200 transition-colors">
                  01656 860844
                </a>
              </p>
              {/* <div className="mb-4">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full px-3 py-2 bg-transparent border border-gray-400 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;