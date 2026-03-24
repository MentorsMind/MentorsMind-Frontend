import React from 'react';
import { Link } from 'react-router-dom';
import { FOOTER_NAVIGATION, ROUTES } from '../../config/routes.config';
import { Globe, Users, Share2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-stellar rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">MentorsMind</span>
            </Link>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-6">
              Empowering global knowledge sharing through a decentralized mentoring platform powered by the Stellar blockchain.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-gray-50 text-gray-400 hover:text-stellar hover:bg-stellar/10 rounded-lg transition-all">
                <Share2 size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-50 text-gray-400 hover:text-stellar hover:bg-stellar/10 rounded-lg transition-all">
                <Globe size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-50 text-gray-400 hover:text-stellar hover:bg-stellar/10 rounded-lg transition-all">
                <Users size={18} />
              </a>
            </div>
          </div>

          {/* Nav Columns */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4">
              {FOOTER_NAVIGATION.PLATFORM.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-gray-500 hover:text-stellar text-sm transition-colors tabular-nums">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4">
              {FOOTER_NAVIGATION.SUPPORT.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-gray-500 hover:text-stellar text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4">
              {FOOTER_NAVIGATION.LEGAL.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-gray-500 hover:text-stellar text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} MentorsMind Ltd. All rights reserved.
          </p>
          <p className="text-gray-400 text-xs flex items-center gap-1">
            Built with <Heart size={12} className="text-red-500 fill-red-500" /> on Stellar
          </p>
        </div>
      </div>
    </footer>
  );
};
