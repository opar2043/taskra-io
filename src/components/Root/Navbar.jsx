import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiX, FiGrid, FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";
import useAuth from "../Hooks/useAuth";
import useLoginUser from "../Hooks/useLoginUser";

const LOGO = "https://i.ibb.co/G4k8xvLB/taskra-logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Find a Professional", to: "/search-professional" },
  { label: "Jobs", to: "/view-alljobs" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, handleLogout } = useAuth();
  const { currentUser } = useLoginUser();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await handleLogout();
      toast.success("Signed out. See you soon!");
      navigate("/");
    } catch {
      toast.error("Couldn't sign out. Please try again.");
    }
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${
      isActive ? "text-primary" : "text-ink hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center shrink-0" aria-label="Taskra home">
          <img src={LOGO} alt="Taskra" className="h-16 w-auto object-contain" />
        </Link>


        

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-line pl-1.5 pr-4 py-1.5 hover:border-ink transition-colors"
              >
                <img
                  src={currentUser?.photo || currentUser?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || user.email)}&background=FFF1E6&color=FE6D06`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-semibold text-ink max-w-[120px] truncate">
                  {currentUser?.name || "Account"}
                </span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 tk-card p-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="tk-nav-link !mx-0"
                  >
                    <FiGrid className="tk-nav-icon" /> Dashboard
                  </Link>
                  <button onClick={onLogout} className="tk-nav-link !mx-0 w-full text-left">
                    <FiLogOut className="tk-nav-icon" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-ink hover:text-primary transition-colors px-3"
              >
                Log in
              </Link>
              <Link to="/professional" className="btn-pill !px-5 !py-2.5 text-sm">
                Join as Professional
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden tk-icon-btn"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu size={22} />
        </button>
      </div>


{/* Mobile drawer */}
<AnimatePresence>
  {open && (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <motion.aside
        className="fixed top-0 right-0 h-screen w-[85%] max-w-[360px] bg-white shadow-2xl z-50 lg:hidden flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <Link to="/" onClick={() => setOpen(false)}>
            <img
              src={LOGO}
              alt="Taskra"
              className="h-12 w-auto object-contain"
            />
          </Link>

          <button
            onClick={() => setOpen(false)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
            aria-label="Close menu"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-[15px] font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-ink hover:bg-gray-100"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Buttons */}
        <div className="border-t border-gray-200 p-6 space-y-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="btn-pill w-full"
              >
                Dashboard
              </Link>

              <button
                onClick={onLogout}
                className="btn-pill-outline w-full"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/professional"
                onClick={() => setOpen(false)}
                className="btn-pill w-full"
              >
                Join as Professional
              </Link>

              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="btn-pill-outline w-full"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </motion.aside>
    </>
  )}
</AnimatePresence>
    </header>
  );
};

export default Navbar;
