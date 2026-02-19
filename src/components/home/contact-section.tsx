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

    if (!formData.name.trim()) {
      newErrors.name = "Naam is verplicht";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail is verplicht";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Voer een geldig e-mailadres in";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Bericht is verplicht";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  return (
    <section id="contact" className="bg-foreground px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Left column: Info */}
          <div>
            <span className="inline-block rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300">
              Contact
            </span>
            <h2 className="mt-5 text-3xl font-light tracking-tight text-accent-foreground sm:text-4xl">
              Neem contact op
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
              Voor vragen of om uw wensen te bespreken, nodigen wij u uit om
              contact op te nemen met ons professionele team via onderstaande
              gegevens.
            </p>

            {/* Contact details */}
            <div className="mt-10 space-y-0">
              <div className="flex items-baseline justify-between border-b border-neutral-800 py-4">
                <span className="text-sm font-semibold text-accent-foreground">
                  Kantoor
                </span>
                <span className="text-sm text-neutral-400">
                  Dorpsstaat 119, 3284 AE Zuid-Beijerland
                </span>
              </div>
              <div className="flex items-baseline justify-between border-b border-neutral-800 py-4">
                <span className="text-sm font-semibold text-accent-foreground">
                  E-mail
                </span>
                <a
                  href="mailto:info@pure-blinds.nl"
                  className="text-sm text-neutral-400 hover:text-accent-foreground transition-colors"
                >
                  info@pure-blinds.nl
                </a>
              </div>
              <div className="flex items-baseline justify-between border-b border-neutral-800 py-4">
                <span className="text-sm font-semibold text-accent-foreground">
                  Telefoon
                </span>
                <a
                  href="tel:+31201234567"
                  className="text-sm text-neutral-400 hover:text-accent-foreground transition-colors"
                >
                  0186 660 510
                </a>
              </div>
            </div>

            {/* Social links */}
            <div className="mt-10">
              <p className="text-sm font-semibold text-accent-foreground">
                Volg ons
              </p>
              <div className="mt-3 flex gap-4">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-neutral-400 hover:text-accent-foreground transition-colors"
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
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-neutral-400 hover:text-accent-foreground transition-colors"
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
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="text-neutral-400 hover:text-accent-foreground transition-colors"
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
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-neutral-400 hover:text-accent-foreground transition-colors"
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

          {/* Right column: Form card */}
          <div className="mt-12 lg:mt-0">
            <div className="rounded-2xl bg-background p-6 sm:p-8">
              {submitted ? (
                <div className="py-12 text-center">
                  <p className="text-sm leading-relaxed text-foreground">
                    Bedankt voor uw bericht. We nemen zo snel mogelijk contact
                    met u op.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      Naam<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Jan Jansen"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-foreground transition-colors rounded-lg"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      E-mail<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="janjansen@email.nl"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-foreground transition-colors rounded-lg"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      Telefoonnummer
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+31 20 123 4567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-foreground transition-colors rounded-lg"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      Bericht<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Hallo, ik wil graag meer weten over..."
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-foreground transition-colors resize-none rounded-lg"
                    />
                    {errors.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-neutral-800 text-accent-foreground py-3 text-sm font-medium tracking-wide transition-colors hover:bg-neutral-700 rounded-lg"
                  >
                    Verstuur bericht
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
