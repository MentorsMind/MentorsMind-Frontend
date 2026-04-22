import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <p className="text-white font-bold text-lg mb-3">⭐ MentorMinds</p>
            <p className="text-sm">Blockchain-powered mentoring on Stellar.</p>
          </div>
          {[
            { title: 'Platform', links: [['Find Mentors', '/mentors'], ['Become a Mentor', '/become-mentor'], ['Pricing', '/pricing']] },
            { title: 'Company',  links: [['About', '/about'], ['Blog', '/blog'], ['Careers', '/careers']] },
            { title: 'Support',  links: [['Help Center', '/help'], ['Privacy', '/privacy'], ['Terms', '/terms']] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-white font-semibold mb-3 text-sm">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(([label, to]) => (
                  <li key={to}><Link to={to} className="text-sm hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-6 text-sm text-center">
          © {new Date().getFullYear()} MentorMinds. Powered by Stellar blockchain.
        </div>
      </div>
    </footer>
  );
}
