import React from 'react';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">ujjwal store</h2>
          <p className="text-sm">
            Your one-stop shop for quality products and unbeatable prices.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h3 className="text-white font-semibold mb-4">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-white">All Products</Link></li>
            <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
            <li><Link href="/offers" className="hover:text-white">Offers</Link></li>
            <li><Link href="/new-arrivals" className="hover:text-white">New Arrivals</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/shipping" className="hover:text-white">Shipping & Returns</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>
          <p className="text-sm mb-2">Email: support@sahandshop.com</p>
          <p className="text-sm mb-4">Phone: +1 (234) 567-890</p>
          <div className="flex space-x-4 text-gray-400">
            <a href="#" aria-label="Facebook" className="hover:text-white"><Facebook size={20} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-white"><Instagram size={20} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-white"><Twitter size={20} /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm">
        &copy; {new Date().getFullYear()} SahandShop. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
