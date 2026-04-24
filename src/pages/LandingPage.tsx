import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const features = [
  { icon: '⚡', title: 'Instant Payments', desc: 'Stellar blockchain settles payments in 3-5 seconds with near-zero fees.' },
  { icon: '🔒', title: 'Secure Escrow', desc: 'Funds are locked in a Soroban smart contract until session completion.' },
  { icon: '🌍', title: 'Global Access', desc: 'Connect with mentors worldwide. Pay in XLM, USDC, or PYUSD.' },
  { icon: '💎', title: 'Transparent Fees', desc: 'Only 5% platform fee. No hidden charges. Full on-chain transparency.' },
  { icon: '🤝', title: 'Verified Mentors', desc: 'All mentors are verified with proven expertise and track records.' },
  { icon: '📊', title: 'Track Progress', desc: 'Monitor your learning journey with detailed analytics and goal tracking.' },
];

const testimonials = [
  { name: 'Sarah K.', role: 'Learner', text: 'Found an amazing Rust mentor and paid instantly with XLM. No bank delays!', avatar: '👩‍💻' },
  { name: 'James O.', role: 'Mentor', text: 'I get paid instantly after every session. The escrow system gives learners confidence.', avatar: '👨‍🏫' },
  { name: 'Priya M.', role: 'Learner', text: 'The Stellar integration makes cross-border payments seamless. Love this platform!', avatar: '👩‍🎓' },
];

const faqs = [
  { q: 'How does payment work?', a: 'Payments are processed on the Stellar blockchain. Funds are held in escrow until your session is complete, then released instantly to the mentor.' },
  { q: 'What currencies are supported?', a: 'We support XLM (Stellar Lumens), USDC, and PYUSD. More assets coming soon.' },
  { q: 'How do I become a mentor?', a: 'Sign up, complete your profile, set your availability and pricing, and start accepting bookings.' },
  { q: 'Is my money safe?', a: 'Yes. Funds are secured by Soroban smart contracts on the Stellar blockchain. Disputes are handled by our resolution team.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <span>⭐</span> Powered by Stellar Blockchain
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Learn from the best.<br />
            <span className="text-indigo-300">Pay instantly.</span>
          </h1>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Connect with expert mentors worldwide. Secure payments via Stellar blockchain with smart contract escrow protection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"><Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">Find a Mentor</Button></Link>
            <Link to="/register?role=mentor"><Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">Become a Mentor</Button></Link>
          </div>
          <div className="flex justify-center gap-8 mt-12 text-sm text-indigo-300">
            <span>✅ 500+ Mentors</span>
            <span>✅ 10,000+ Sessions</span>
            <span>✅ $2M+ Paid Out</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why MentorMinds?</h2>
          <p className="text-center text-gray-500 mb-12">The first mentoring platform built on blockchain for trust and transparency.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <Card key={f.title} hover>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What our community says</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <Card key={t.name}>
                <p className="text-gray-600 text-sm mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.avatar}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-indigo-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-500 mb-8">Mentors set their own rates. We only charge a 5% platform fee.</p>
          <Card className="inline-block text-left">
            <div className="text-center mb-6">
              <span className="text-5xl font-bold text-indigo-600">5%</span>
              <p className="text-gray-500 mt-1">Platform fee per session</p>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              {['No subscription fees', 'No hidden charges', 'Instant blockchain settlement', 'Smart contract escrow protection', 'Multi-currency support'].map(i => (
                <li key={i} className="flex items-center gap-2"><span className="text-green-500">✓</span>{i}</li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map(f => (
              <Card key={f.q}>
                <h3 className="font-semibold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-500 text-sm">{f.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-indigo-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
        <p className="text-indigo-200 mb-8">Join thousands of learners and mentors on the Stellar blockchain.</p>
        <Link to="/register"><Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">Get Started Free</Button></Link>
      </section>
    </div>
  );
}
