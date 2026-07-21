import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";

// Editorial contact page. The original form has no submit target (button is
// type="button" and Web3Forms is only used in the payment flow), so the form
// stays presentational here for parity.
// TODO: backend route missing — no contact-form endpoint exists; wire one (or
// Web3Forms via VITE_WEB3FORMS_KEY) when available.
const Contact = () => {
  return (
    <div className="min-h-screen bg-cream py-16 md:py-24 relative overflow-hidden">
      <div className="dot-grid absolute top-12 right-8 w-36 h-36 opacity-40 pointer-events-none hidden lg:block" />

      <div className="max-w-7xl w-full md:w-11/12 mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="mb-12 max-w-3xl">
          <span className="mk-eyebrow mb-4 block">Get In Touch</span>
          <h1 className="mk-h1 mb-6">Contact</h1>
          <p className="mk-lead">
            Get in touch with our team. We're here to help you find the perfect creative
            professional or answer any questions about joining our platform.
          </p>
        </div>

        {/* Two columns */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-20 border-t border-line pt-12">
          {/* Left — form */}
          <div className="bg-white rounded-2xl border border-line shadow-soft p-8 md:p-10">
            <h2 className="font-display text-2xl font-semibold text-ink mb-8">
              Send us a message
            </h2>

            <form className="space-y-8">
              <div className="border-b border-line pb-2">
                <label className="block text-xs font-bold text-body-text/70 uppercase tracking-widest mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full bg-transparent border-none p-0 text-ink placeholder:text-body-text/40 outline-none text-base"
                  placeholder="Full name"
                />
              </div>

              <div className="border-b border-line pb-2">
                <label className="block text-xs font-bold text-body-text/70 uppercase tracking-widest mb-2">
                  Mobile
                </label>
                <input
                  type="tel"
                  className="w-full bg-transparent border-none p-0 text-ink placeholder:text-body-text/40 outline-none text-base"
                  placeholder="+44 7..."
                />
              </div>

              <div className="border-b border-line pb-2">
                <label className="block text-xs font-bold text-body-text/70 uppercase tracking-widest mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full bg-transparent border-none p-0 text-ink placeholder:text-body-text/40 outline-none text-base"
                  placeholder="you@example.com"
                />
              </div>

              <div className="border-b border-line pb-2">
                <label className="block text-xs font-bold text-body-text/70 uppercase tracking-widest mb-2">
                  Message
                </label>
                <textarea
                  rows="3"
                  className="w-full bg-transparent border-none p-0 text-ink placeholder:text-body-text/40 outline-none resize-none text-base"
                  placeholder="Tell us about sizing, an order, or feedback..."
                ></textarea>
              </div>

              <div className="pt-6 border-t border-line">
                <button type="button" className="btn-pill">
                  Send Message
                </button>
                <p className="text-xs text-body-text/70 mt-4">
                  We use your details only to respond. No spam, ever.
                </p>
              </div>
            </form>
          </div>

          {/* Right — studio details */}
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink mb-8">
              Studio details
            </h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="icon-chip !w-11 !h-11">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink mb-1">Location</h4>
                  <p className="text-base text-ink">London, United Kingdom</p>
                  <p className="text-sm text-body-text mt-1">
                    Private studio — visits by appointment only.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="icon-chip !w-11 !h-11">
                  <FiPhone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink mb-1">Phone / WhatsApp</h4>
                  <p className="text-base text-ink">+44 07502 036676</p>
                  <p className="text-sm text-body-text mt-1">
                    Mon-Fri, 09:00-17:00 (UK time)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="icon-chip !w-11 !h-11">
                  <FiMail size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-ink mb-1">Email</h4>
                  <p className="text-base text-ink">support@taskra.com</p>
                  <p className="text-sm text-body-text mt-1">
                    We respond within one business day.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-sm text-body-text leading-relaxed max-w-sm">
              For press, partnerships, or styling requests, mention it in your message. It
              will reach our studio team directly.
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="frame-img w-full overflow-hidden" style={{ height: "420px" }}>
          <iframe
            src="https://maps.google.com/maps?q=London,%20UK&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            className="rounded-xl"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="London Office Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
