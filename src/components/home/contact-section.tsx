"use client";

import { useState } from "react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    // Phone is optional, no validation

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Success
    setErrors({});
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  return (
    <section
      id="contact"
      className="border-t border-border bg-background px-6 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">
            Get in Touch
          </p>
          <h2 className="mt-3 text-3xl font-light tracking-tight text-foreground">
            Let&rsquo;s talk about your project
          </h2>
        </div>

        <div className="mt-12 lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Left column: Contact form */}
          <div>
            {submitted ? (
              <div className="rounded-lg border border-border bg-surface p-6 text-center">
                <p className="text-sm leading-relaxed text-foreground">
                  Thank you for your message. We&rsquo;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-foreground transition-colors resize-none"
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground py-3 text-sm font-medium tracking-wide transition-opacity hover:opacity-80"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Right column: Business info */}
          <div className="mt-12 lg:mt-0 space-y-8">
            {/* Office address */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                Our Office
              </h3>
              <p className="mt-3 text-sm text-muted leading-relaxed whitespace-pre-line">
                Keizersgracht 123
                {"\n"}1015 CJ Amsterdam
                {"\n"}The Netherlands
              </p>
            </div>

            {/* Contact details */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                Contact
              </h3>
              <div className="mt-3 space-y-2">
                <p>
                  <a
                    href="mailto:info@pureblinds.nl"
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    info@pureblinds.nl
                  </a>
                </p>
                <p>
                  <a
                    href="tel:+31201234567"
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    +31 20 123 4567
                  </a>
                </p>
              </div>
            </div>

            {/* Social links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                Follow Us
              </h3>
              <div className="mt-3 flex gap-4">
                {/* Instagram */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-muted hover:text-foreground transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-muted hover:text-foreground transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                {/* Pinterest */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="text-muted hover:text-foreground transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="2" x2="12" y2="8" />
                    <path d="M12 8c-2.8 0-5 2.2-5 5 0 1.9 1.1 3.6 2.7 4.4.2.1.5.1.6-.1l.4-1.5c.1-.2 0-.4-.1-.6-.5-.6-.8-1.4-.8-2.2 0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5c0 2.3-1 4.2-2.5 4.2-.8 0-1.4-.7-1.2-1.5.2-1 .6-2.1.6-2.8 0-.6-.3-1.1-1-1.1-.8 0-1.4.8-1.4 1.9 0 .7.2 1.2.2 1.2l-.9 3.6c-.3 1.2-.1 2.7 0 2.8 0 .1.2.1.3.1.1-.1 1.8-2.2 2.2-3.4l.5-1.8c.3.5.9.9 1.7.9 2.2 0 3.7-2 3.7-4.7C17.5 8.9 15.3 7 12.5 7z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-muted hover:text-foreground transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
