import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa6";
import { FiMail, FiMapPin, FiArrowRight } from "react-icons/fi";

const LOGO = "https://i.ibb.co/G4k8xvLB/taskra-logo.png";

const footerLinks = [
  {
    title: "For Customers",
    links: [
      { label: "Find a Professional", to: "/search-professional" },
      { label: "Browse Jobs", to: "/view-alljobs" },
      { label: "Login", to: "/login" },
    ],
  },
  {
    title: "For Professionals",
    links: [
      { label: "Join as a Professional", to: "/professional" },
      { label: "Pricing", to: "/pricing" },
      { label: "Create Account", to: "/register" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about-us" },
      { label: "Careers", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

const socials = [
  { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/taskra.io?igsh=MXY1cHA1MGVqYzczbA%3D%3D&utm_source=qr",
    label: "Instagram",
  },
  { icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: FaTiktok, href: "https://tiktok.com/@taskra.io", label: "TikTok" },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return toast("Enter your email first", { icon: "⚠️" });
    setEmail("");
    toast.success("You're on the list — welcome to Taskra!");
  };

  return (
    <footer className="bg-cream border-t border-line relative overflow-hidden">
      {/* subtle dotted texture */}
      <div className="absolute top-8 right-8 w-40 h-40 dot-grid opacity-40 pointer-events-none" />

      {/* Newsletter band */}
      <div className="max-w-7xl mx-auto px-6 pt-14">
        <div className="tk-card !bg-white flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-10">
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-1">
              Stay in the frame.
            </h3>
            <p className="text-sm text-body-text">
              Tips, featured creatives, and new leads — straight to your inbox.
            </p>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="flex w-full md:w-auto items-center bg-cream border border-line rounded-full p-1.5 pl-5"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="bg-transparent outline-none text-sm text-ink placeholder:text-body-text/50 flex-1 md:w-64"
            />
            <button type="submit" className="btn-pill !px-5 !py-2.5 text-sm" aria-label="Subscribe">
              Subscribe <FiArrowRight />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={LOGO} alt="Taskra" className="h-9 w-auto object-contain" />
              <span className="text-xl font-black text-ink">Taskra</span>
            </Link>
            <p className="text-sm text-body-text leading-relaxed max-w-xs mb-5">
              Empowering creatives worldwide. Connect with trusted photographers
              and videographers for every occasion.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center text-body-text hover:bg-primary hover:border-primary hover:text-white transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <nav key={col.title} className="flex flex-col">
              <h6 className="text-sm font-bold text-ink uppercase tracking-wide mb-4">
                {col.title}
              </h6>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-body-text hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contact / Help column */}
          <div className="col-span-2 md:col-span-1">
            <h6 className="text-sm font-bold text-ink uppercase tracking-wide mb-4">
              Need help?
            </h6>
            <ul className="space-y-3 mb-5">
              <li className="flex items-center gap-2 text-sm text-body-text">
                <FiMail className="text-primary flex-shrink-0" />
                <a
                  href="mailto:support@taskra.com"
                  className="hover:text-primary transition-colors break-all"
                >
                  support@taskra.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-body-text">
                <FiMapPin className="text-primary flex-shrink-0" />
                <span className="flex items-center gap-1">
                  <img
                    src="https://flagcdn.com/w20/gb.webp"
                    alt="UK"
                    loading="lazy"
                    className="w-4 h-3 object-cover rounded-sm"
                  />
                  United Kingdom
                </span>
              </li>
            </ul>
            <Link to="/contact" className="btn-pill !px-5 !py-2.5 text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line relative">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-body-text text-center sm:text-left">
            © {new Date().getFullYear()} Taskra.com Global Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-sm text-body-text">
            <Link to="/about" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
