import { Clock, DollarSign, Globe, Shield, LineChart } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Instant Settlement',
    description: 'Near-instant transactions on Stellar with no waiting periods.',
  },
  {
    icon: DollarSign,
    title: 'Low Fees',
    description: 'Transparent, minimal fees with efficient payment rails.',
  },
  {
    icon: Shield,
    title: 'Escrow Protection',
    description: 'Funds are protected until sessions are completed.',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Borderless payments without traditional banking.',
  },
  {
    icon: LineChart,
    title: 'On-chain Transparency',
    description: 'Auditable transactions with clear records.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" aria-label="Features" className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Why Stellar for Mentorship</h2>
          <p className="text-gray-600 mt-3">
            Fast, secure, and transparent payments built for a global learning community.
          </p>
        </div>
        <div
          data-testid="features-grid"
          className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="w-10 h-10 rounded-xl bg-stellar/10 text-stellar flex items-center justify-center">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-bold text-lg">{title}</h3>
              <p className="mt-2 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
