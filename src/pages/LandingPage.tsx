import { useEffect } from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import PricingSection from '../components/landing/PricingSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'MentorMinds Stellar — Learn globally, pay instantly';
    const meta = [
      { name: 'description', content: 'Mentorship platform powered by Stellar. Escrow protection, instant payments, global access, and transparent fees.' },
      { name: 'keywords', content: 'mentorship, stellar, blockchain, escrow, payments, global, mentors, learners' },
      { property: 'og:title', content: 'MentorMinds Stellar' },
      { property: 'og:description', content: 'Learn with global mentors and pay securely with Stellar.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'MentorMinds Stellar' },
      { name: 'twitter:description', content: 'Mentorship with instant, global payments.' },
    ];
    meta.forEach((m) => {
      const selector = m.name ? `meta[name="${m.name}"]` : `meta[property="${m.property}"]`;
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (m.name) el.setAttribute('name', m.name);
        if ('property' in m && m.property) el.setAttribute('property', m.property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', m.content);
    });
  }, []);

  return (
    <div className="scroll-smooth">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
