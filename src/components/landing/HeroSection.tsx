import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Rocket, Shield, Globe } from 'lucide-react';

export default function HeroSection() {
  const [users, setUsers] = useState(0);
  const [volume, setVolume] = useState(0);
  const usersTarget = 12000;
  const volumeTarget = 250000;
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    const step = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      setUsers(Math.floor(usersTarget * p));
      setVolume(Math.floor(volumeTarget * p));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section id="hero" aria-label="Hero" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-stellar/10 via-white to-white pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stellar/10 text-stellar font-bold text-xs">
              <Rocket className="w-4 h-4" aria-hidden="true" />
              Powered by Stellar
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Learn with global mentors, get paid instantly with Stellar
            </h1>
            <p className="text-gray-600 text-lg">
              A trust-first mentorship platform with escrow protection, transparent fees, and lightning-fast payments on the Stellar blockchain.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#pricing"
                className="px-6 py-3 bg-stellar text-white rounded-xl font-bold hover:bg-stellar-dark transition-colors inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#features"
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Explore Features
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Shield className="w-4 h-4 text-stellar" aria-hidden="true" />
                Escrow-secured payments
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Globe className="w-4 h-4 text-stellar" aria-hidden="true" />
                Borderless access
              </div>
            </div>
          </div>
          <div className="md:pl-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-primary-50 rounded-2xl p-5">
                  <div className="text-sm text-gray-500">Active Learners</div>
                  <div className="text-3xl font-bold">{users.toLocaleString()}</div>
                  <div className="mt-2 text-xs text-gray-500">Trusted worldwide</div>
                </div>
                <div className="bg-primary-50 rounded-2xl p-5">
                  <div className="text-sm text-gray-500">XLM Volume</div>
                  <div className="text-3xl font-bold">{volume.toLocaleString()}+</div>
                  <div className="mt-2 text-xs text-gray-500">Processed securely</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-sm text-gray-500">Avg. Session Rating</div>
                  <div className="text-3xl font-bold">4.8★</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-sm text-gray-500">Mentors Available</div>
                  <div className="text-3xl font-bold">500+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
