export default function PricingSection() {
  return (
    <section id="pricing" aria-label="Pricing" className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 mt-3">Fair distribution for mentors and a sustainable platform.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="text-sm text-gray-500">Mentor Earnings</div>
            <div className="mt-2 text-4xl font-extrabold">80%</div>
            <p className="mt-2 text-gray-600">Instant settlement on session completion.</p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="text-sm text-gray-500">Platform Fee</div>
            <div className="mt-2 text-4xl font-extrabold">20%</div>
            <p className="mt-2 text-gray-600">Supports operations, security, and growth.</p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="text-sm text-gray-500">Transaction Fees</div>
            <div className="mt-2 text-4xl font-extrabold">Minimal</div>
            <p className="mt-2 text-gray-600">Low network fees on Stellar blockchain.</p>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <a
            href="#cta"
            className="px-6 py-3 bg-stellar text-white rounded-xl font-bold hover:bg-stellar-dark transition-colors"
          >
            Start Learning
          </a>
        </div>
      </div>
    </section>
  );
}
