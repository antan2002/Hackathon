import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      {/* Newsletter */}
      <div className="bg-[#0071ce] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Sign up for email updates</h3>
              <p className="text-blue-100">Get the latest deals and offers delivered to your inbox</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-4 py-2 text-gray-900 rounded-l-lg focus:outline-none"
              />
              <button className="bg-[#ffc220] text-[#0071ce] px-6 py-2 rounded-r-lg hover:bg-yellow-300 transition-colors font-semibold">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-lg mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="text-gray-300 hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-gray-300 hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/track-order" className="text-gray-300 hover:text-white transition-colors">Track Your Order</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-bold text-lg mb-4">About Walmart</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-300 hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/sustainability" className="text-gray-300 hover:text-white transition-colors">Sustainability</Link></li>
              <li><Link to="/investors" className="text-gray-300 hover:text-white transition-colors">Investor Relations</Link></li>
              <li><Link to="/press" className="text-gray-300 hover:text-white transition-colors">Press Releases</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/deals" className="text-gray-300 hover:text-white transition-colors">Today's Deals</Link></li>
              <li><Link to="/gift-cards" className="text-gray-300 hover:text-white transition-colors">Gift Cards</Link></li>
              <li><Link to="/store-finder" className="text-gray-300 hover:text-white transition-colors">Store Finder</Link></li>
              <li><Link to="/pharmacy" className="text-gray-300 hover:text-white transition-colors">Pharmacy</Link></li>
              <li><Link to="/grocery" className="text-gray-300 hover:text-white transition-colors">Grocery Pickup</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-bold text-lg mb-4">Connect With Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
            <div className="text-gray-300">
              <p className="mb-2">Customer Service: 1-800-WALMART</p>
              <p>Available 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment methods and bottom bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-gray-300">Payment Methods:</span>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-gray-600 rounded"></div>
                <div className="w-8 h-5 bg-gray-600 rounded"></div>
                <div className="w-8 h-5 bg-gray-600 rounded"></div>
                <div className="w-8 h-5 bg-gray-600 rounded"></div>
              </div>
            </div>
            <div className="text-center md:text-right text-gray-300 text-sm">
              <p>&copy; 2025 Walmart Inc. All rights reserved.</p>
              <div className="flex space-x-4 mt-2">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;