export default function CTASection() {
  return (
    <section id="cta" aria-label="Call to action" className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-stellar rounded-[2rem] p-8 md:p-12 text-white">
          <h2 className="text-2xl md:text-3xl font-extrabold">Start your learning journey today</h2>
          <p className="mt-2 text-white/80">Find the right mentor, pay securely, and grow faster with Stellar.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#pricing"
              className="px-6 py-3 bg-white text-stellar rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="px-6 py-3 bg-stellar-dark text-white rounded-xl font-bold hover:bg-stellar/90 transition-colors"
            >
              Explore Mentors
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
