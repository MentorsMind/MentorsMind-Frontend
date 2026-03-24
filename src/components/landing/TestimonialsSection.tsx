export default function TestimonialsSection() {
  const testimonials = [
    {
      role: 'Mentor',
      name: 'Amina K.',
      quote:
        'Payments settle instantly and my learners feel safe with escrow. Stellar makes mentoring across borders effortless.',
    },
    {
      role: 'Learner',
      name: 'Diego R.',
      quote:
        'I booked sessions with a mentor in another country without bank hassles. Transparent fees and great experience.',
    },
    {
      role: 'Learner',
      name: 'Li Wei',
      quote:
        'The platform makes it easy to track sessions and costs. Smooth and secure from start to finish.',
    },
  ];

  return (
    <section id="testimonials" aria-label="Testimonials" className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Loved by Mentors and Learners</h2>
          <p className="text-gray-600 mt-3">Real stories from our global community.</p>
        </div>
        <div role="list" className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure
              role="listitem"
              key={t.name}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 animate-in fade-in duration-700"
            >
              <blockquote className="text-gray-700 leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-sm text-gray-500">
                {t.name} • {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
