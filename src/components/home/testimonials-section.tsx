export function TestimonialsSection() {
  const testimonials = [
    {
      rating: 5,
      quote:
        "The custom curtains fit perfectly and the quality exceeded our expectations. Great service from start to finish.",
      name: "David Anderson",
      role: "Homeowner",
    },
    {
      rating: 5,
      quote:
        "Fast turnaround time and exceptional attention to detail. The exact dimensions we needed for our restaurant.",
      name: "Sophie Laurent",
      role: "Restaurant Owner",
    },
    {
      rating: 5,
      quote:
        "Professional installation fabrics that transformed our office space. Highly recommend for commercial projects.",
      name: "Michael Brown",
      role: "Office Manager",
    },
    {
      rating: 4,
      quote:
        "Beautiful fabric quality and perfect measurements. Minor delay in shipping but worth the wait.",
      name: "Jessica Wang",
      role: "Interior Designer",
    },
    {
      rating: 5,
      quote:
        "Outstanding service for our hotel renovation. Custom sizes handled with precision and delivered on schedule.",
      name: "Thomas Mueller",
      role: "Hotel Manager",
    },
    {
      rating: 5,
      quote:
        "Made our event booth look professional and polished. Easy ordering process and quick production.",
      name: "Rachel Green",
      role: "Event Planner",
    },
  ];

  return (
    <section id="testimonials" className="bg-foreground px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
          Testimonials
        </p>
        <h2 className="mt-3 text-3xl font-light tracking-tight text-accent-foreground sm:text-4xl">
          What our clients say
        </h2>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="border border-neutral-700 rounded-lg p-6"
            >
              {/* Star rating */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 fill-current text-accent-foreground"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed text-neutral-300">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-4 text-sm">
                <span className="font-medium text-accent-foreground">
                  {testimonial.name}
                </span>
                <span className="text-neutral-400"> &middot; </span>
                <span className="text-neutral-400">{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
