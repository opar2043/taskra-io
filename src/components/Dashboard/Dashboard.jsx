import { useEffect, useRef, useState } from "react";
import { Link, Navigate, NavLink, useNavigate, useOutlet } from "react-router-dom";
import {
  FaBars,
  FaSearch,
  FaEnvelope,
  FaChevronDown,
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import useAuth from "../Hooks/useAuth";
import useAdmin from "../Hooks/useAdmin";
import useClient from "../Hooks/useClient";
import useFreelancer from "../Hooks/useFreelencer";
import useLoginUser from "../Hooks/useLoginUser";
import Loading from "../Root/Loading";
import NotificationBar from "./SharedPanel/NotificationBar";
import AdminRoute from "./Routes/AdminRoute";
import ClientRoute from "./Routes/ClientRoute";
import FreelencerRout from "./Routes/FreelencerRout";

const LOGO = "https://i.ibb.co/G4k8xvLB/taskra-logo.png";

// Dashboard shell — layout route for every /dashboard/* page.
const Dashboard = () => {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const { user, loading, handleLogout } = useAuth();
  const { currentUser, isLoading } = useLoginUser();
  const isadmin = useAdmin();
  const isclient = useClient();
  const isfreelancer = useFreelancer();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileMenuRef = useRef(null);

  // Close the avatar dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logOut = () => {
    handleLogout()
      .then(() => {
        toast.success("Logged out successfully");
        navigate("/");
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate("/search-professional", { state: { searchCity: searchQuery } });
    }
  };

  // Unauthenticated visitors have no business on the dashboard.
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  // While Firebase auth or the DB user record (and therefore the role)
  // is still resolving, show a spinner instead of a role-less shell.
  if (loading || (user && !currentUser && isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <Loading />
      </div>
    );
  }

  const roleLabel = isadmin ? "Admin" : isfreelancer ? "Professional" : "Client";

  return (
    <div className="flex min-h-screen bg-app-bg">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-ink/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-line-app flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo header */}
        <div className="flex items-center px-5 h-16 border-b border-line-app shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={LOGO}
              alt="Taskra logo"
              className="h-9 w-auto object-contain shrink-0"
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none text-ink">Taskra</h1>
              <p className="text-[9px] font-semibold uppercase tracking-widest leading-none mt-0.5 text-body-text/60">
                Dashboard
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
          {isadmin && <AdminRoute currentUser={currentUser} />}
          {isclient && <ClientRoute currentUser={currentUser} />}
          {isfreelancer && <FreelencerRout currentUser={currentUser} />}

          {/* Home link (all roles) — deliberately distinct red pill */}
          <div className="mt-4 pt-3 border-t border-line-app">
            <NavLink to="/" className="tk-nav-home">
              <FaHome className="tk-nav-icon" />
              <span>Back to Home</span>
            </NavLink>
          </div>
        </nav>

        {/* User profile card — pinned bottom */}
        <div className="border-t border-line-app p-3 shrink-0">
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-app-bg transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-primary-tint text-primary flex items-center justify-center font-semibold text-sm overflow-hidden shrink-0">
              {currentUser?.photo ? (
                <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                (currentUser?.name?.[0] || "U").toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink truncate">
                {currentUser?.name || "User Name"}
              </p>
              <p className="text-[11px] text-body-text/70 truncate">{roleLabel}</p>
            </div>
          </Link>
          <p className="text-[10px] text-center text-body-text/50 mt-2">
            &copy; {new Date().getFullYear()} Taskra.io
          </p>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 md:ml-64 w-full max-w-[100vw] md:max-w-none">
        {/* Sticky topbar */}
        <header className="bg-surface/95 backdrop-blur border-b border-line-app sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4 px-4 md:px-6 h-16">
            {/* Hamburger + search */}
            <div className="flex items-center flex-1 max-w-xl">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden mr-3 tk-icon-btn"
                aria-label="Open menu"
              >
                <FaBars className="text-xl" />
              </button>
              <div className="relative flex-1 group">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary text-sm pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search jobs, professionals, projects…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full h-11 pl-11 pr-16 rounded-full bg-app-bg border border-transparent text-sm text-ink placeholder:text-body-text/50 focus:outline-none focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/15 transition"
                />
                <kbd className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 px-2 py-0.5 rounded-md bg-white border border-line-app text-[10px] font-semibold text-body-text/60">
                  ↵
                </kbd>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-6">
              {/* Notifications + messages grouped on a soft rail */}
              <div className="flex items-center gap-1 rounded-full bg-app-bg p-1">
                <NotificationBar />
                <Link
                  to={`/chat/${currentUser?._id}`}
                  className="relative w-9 h-9 rounded-full flex items-center justify-center text-ink/70 hover:bg-white hover:text-primary transition-colors"
                  aria-label="Messages"
                >
                  <FaEnvelope className="text-[17px]" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-success-text rounded-full ring-2 ring-app-bg"></span>
                </Link>
              </div>

              {/* Avatar dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu((v) => !v)}
                  className="flex items-center gap-2 md:gap-3 p-1 md:pr-3 rounded-full hover:bg-app-bg transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary-tint text-primary flex items-center justify-center font-bold text-sm overflow-hidden ring-2 ring-primary/15">
                    {currentUser?.photo ? (
                      <img
                        src={currentUser.photo}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (currentUser?.name?.[0] || "U").toUpperCase()
                    )}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-ink leading-tight">
                      {currentUser?.name || "User Name"}
                    </p>
                    <p className="text-xs font-medium text-primary leading-tight">{roleLabel}</p>
                  </div>
                  <FaChevronDown className="text-body-text/50 text-xs hidden md:block" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 tk-card py-2 z-50">
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-body-text hover:bg-primary-tint hover:text-primary transition-colors"
                    >
                      <FaUserCircle /> My Profile
                    </Link>
                    <Link
                      to={`/chat/${currentUser?._id}`}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-body-text hover:bg-primary-tint hover:text-primary transition-colors"
                    >
                      <FaEnvelope /> Messages
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-body-text hover:bg-primary-tint hover:text-primary transition-colors"
                    >
                      <FaHome /> Back to Home
                    </Link>
                    <hr className="my-2 border-line-app" />
                    <button
                      onClick={logOut}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-danger-text hover:bg-danger-bg w-full text-left transition-colors"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="w-full overflow-x-hidden bg-app-bg min-h-[calc(100vh-4rem)]">
          {outlet || (
            <div className="tk-page">
              <h2 className="tk-page-title">Welcome to your Taskra dashboard</h2>
              <p className="text-sm text-body-text">Pick a page from the sidebar to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
