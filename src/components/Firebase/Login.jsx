import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useQueryClient } from "@tanstack/react-query";

import useAuth from "../Hooks/useAuth";
import useAxios from "../Hooks/useAxios";
import useUser from "../Hooks/useUser";
import { firebaseError } from "../utils/firebaseErrors";
import { alertError } from "../utils/toastConfirm";

const LOGO = "https://i.ibb.co/G4k8xvLB/taskra-logo.png";
const VISUAL =
  "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=1200&auto=format&fit=crop&fm=webp";

const Login = () => {
  const { handleLogin, handleGoogle, resetPass } = useAuth();
  const { users } = useUser();
  const navigate = useNavigate();
  const axiosSecure = useAxios();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef();

  const handleSignIn = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    setSubmitting(true);
    handleLogin(email, password)
      .then(() => {
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      })
      .catch((err) => {
        alertError("Login failed", firebaseError(err, "Invalid email or password."));
      })
      .finally(() => setSubmitting(false));
  };

  const handleForget = () => {
    const email = emailRef.current?.value?.trim();

    if (!email) {
      return alertError(
        "Email required",
        "Enter your email address above, then click 'Forgot your password?'"
      );
    }

    resetPass(email)
      .then(() => {
        toast.success("A password reset link has been sent to your inbox.");
      })
      .catch((err) => {
        alertError("Reset failed", firebaseError(err, "Could not send reset email."));
      });
  };

  const handleGoogleAccount = () => {
    handleGoogle()
      .then(async (res) => {
        // Only create a backend record if this Google account is new to us.
        const exists = users?.some((u) => u.email === res.user.email);
        if (!exists) {
          try {
            await axiosSecure.post("/users", {
              name: res.user.displayName,
              email: res.user.email,
              photo: res.user.photoURL,
              role: "client",
            });
            queryClient.invalidateQueries({ queryKey: ["users"] });
          } catch (err) {
            console.error("Failed to save Google user:", err);
          }
        }

        toast.success("Signed in with Google");
        navigate("/dashboard");
      })
      .catch((err) => {
        alertError("Google sign-in failed", firebaseError(err, "Could not sign in with Google."));
      });
  };

  return (
    <section className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-5xl bg-white rounded-2xl border border-line shadow-soft overflow-hidden grid grid-cols-1 lg:grid-cols-2"
      >
        {/* Form side */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <img src={LOGO} alt="Taskra" className="h-10 w-auto self-start mb-8" />

          <p className="mk-eyebrow mb-2">Welcome back</p>
          <h1 className="mk-h2 mb-2">Sign in to Taskra</h1>
          <p className="text-body-text mb-8">
            Pick up where you left off — jobs, proposals and messages are waiting.
          </p>

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-body-text/60" />
              <input
                ref={emailRef}
                name="email"
                type="email"
                placeholder="Email address"
                className="w-full rounded-full border border-line bg-white pl-11 pr-4 py-3.5 text-sm text-ink placeholder:text-body-text/50 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-body-text/60" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full rounded-full border border-line bg-white pl-11 pr-11 py-3.5 text-sm text-ink placeholder:text-body-text/50 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-body-text/60 hover:text-ink transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink cursor-pointer">
                <input type="checkbox" className="accent-primary" />
                Keep me signed in
              </label>
              <button
                type="button"
                onClick={handleForget}
                className="text-primary font-semibold hover:underline"
              >
                Forgot your password?
              </button>
            </div>

            <button type="submit" disabled={submitting} className="btn-pill w-full">
              {submitting ? "Signing in…" : "Login"}
            </button>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs uppercase tracking-widest text-body-text/60">or</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAccount}
              className="btn-pill-outline w-full"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <p className="text-center text-sm text-body-text pt-2">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>

        {/* Visual side */}
        <div className="hidden lg:flex bg-cream items-center justify-center p-10 relative">
          <div className="absolute top-6 right-6 w-24 h-24 dot-grid rounded-xl opacity-70" />
          <div className="frame-img w-full max-w-md rotate-1">
            <img src={VISUAL} alt="Photographer at work" className="aspect-[4/5]" />
          </div>
          <p className="absolute bottom-8 left-10 right-10 text-sm text-body-text/80 italic text-center">
            &ldquo;Every brief deserves the right creative behind the lens.&rdquo;
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;
