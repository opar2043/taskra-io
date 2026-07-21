import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import useAxios from "../Hooks/useAxios";
import useAuth from "../Hooks/useAuth";
import useInboxQuote from "../Hooks/useInboxQuote";
import Loading from "../Root/Loading";
import {
  FaShieldAlt,
  FaLock,
  FaCamera,
  FaCloudDownloadAlt,
  FaCheckCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaArrowRight,
  FaImage,
  FaMapMarkerAlt,
  FaProjectDiagram,
  FaCalendarAlt,
} from "react-icons/fa";

/* ── Email helpers (Web3Forms order notification) ── */
function buildOrderEmailMessage({ order }) {
  const now = new Date().toLocaleString();

  return `
NEW ORDER — Taskra Photography Marketplace

CUSTOMER
Name: ${order.userName || "N/A"}
Email: ${order.userEmail || "N/A"}
Phone: ${order.phone || "N/A"}
Address: ${order.address || "N/A"}
Category: ${order.category || "N/A"}

PROJECT
Client: ${order.item?.clientName || "N/A"}
Requirement: ${order.item?.requirement || "N/A"}
Timeline: ${order.item?.timeline || "N/A"}

PAYMENT
Subtotal: £${Number(order.subtotal || 0).toFixed(2)}
Total: £${Number(order.total).toFixed(2)}
Transaction ID: Pending (Mollie)
Status: Pending

Placed On: ${now}
Taskra — UK Photography Marketplace
  `.trim();
}

function buildWeb3FormsBody({ message, customerEmail, customerName }) {
  return {
    access_key: import.meta.env.VITE_WEB3FORMS_KEY,
    from_name: "Taskra Authorities",
    subject: `New License Purchase - ${customerName || customerEmail || "Customer"}`,
    message,
    replyto: customerEmail || "noreply@taskra.co.uk",
    emails: `, ${customerEmail || ""}`.trim(),
  };
}

async function sendOrderEmail(web3Body) {
  const resp = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(web3Body),
  });
  return resp.json();
}

/* ── Small building blocks ── */
const Field = ({ icon: Icon, label, ...props }) => (
  <div>
    {label && <label className="tk-label">{label}</label>}
    <div className="relative">
      {Icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
          <Icon size={14} />
        </span>
      )}
      <input {...props} className={`tk-input ${Icon ? "pl-10" : ""}`} />
    </div>
  </div>
);

const SelectField = ({ icon: Icon, label, options, ...props }) => (
  <div>
    {label && <label className="tk-label">{label}</label>}
    <div className="relative">
      {Icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none z-10">
          <Icon size={14} />
        </span>
      )}
      <select
        {...props}
        className={`tk-input appearance-none cursor-pointer ${Icon ? "pl-10" : ""}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SectionHeader = ({ step, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="shrink-0 w-8 h-8 rounded-xl bg-primary text-white text-sm font-bold flex items-center justify-center">
      {step}
    </div>
    <div>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {subtitle && (
        <p className="text-xs text-body-text/70 mt-0.5 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

const TrustBadge = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-1.5 text-xs text-body-text/70 font-medium">
    {Icon && <Icon size={12} className="text-primary" />}
    <span>{text}</span>
  </div>
);

/* ── Main checkout ── */
// id = inbox-quote (agreement) _id. The agreement's price is the amount.
// Flow: POST /orders (status "confirmed") → POST /create-mollie-payment
// {amount, orderData} → redirect to checkoutUrl. Mollie sends the user back
// to /payment-success?id=<agreement _id>.
const CheckoutForm = ({ id }) => {
  const axiosSecure = useAxios();
  const { user } = useAuth();
  const [inboxQuote, , isLoading] = useInboxQuote();

  const [err, setErr] = useState("");
  const [processing, setProcessing] = useState(false);

  const [name, setName] = useState(user?.displayName || "");
  const [gmail, setGmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");

  const projectPrice = inboxQuote && inboxQuote.find((p) => p._id == id);
  const subtotal = useMemo(() => {
    if (!projectPrice) return 0;
    return Number(projectPrice.price) || 0;
  }, [projectPrice]);

  const total = subtotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErr("");

    try {
      const orderData = {
        userEmail: user?.email || gmail,
        userName: name,
        phone,
        address,
        category,
        subtotal,
        total,
        item: projectPrice,
        transactionId: "pending_mollie",
        status: "confirmed",
        date: new Date().toISOString(),
      };

      // 1. Notify by email + save the order (side by side; order save must win).
      const message = buildOrderEmailMessage({ order: orderData });
      const web3formsBody = buildWeb3FormsBody({
        message,
        customerEmail: orderData.userEmail,
        customerName: orderData.userName,
      });

      const [, saveResult] = await Promise.allSettled([
        sendOrderEmail(web3formsBody),
        axiosSecure.post("/orders", orderData),
      ]);

      if (
        saveResult.status !== "fulfilled" ||
        !(
          saveResult.value?.status === 200 ||
          saveResult.value?.status === 201 ||
          saveResult.value?.data?.insertedId
        )
      ) {
        console.error("Order save failed:", saveResult.reason);
      }

      if (!projectPrice) {
        throw new Error(
          "Project details not found. Please refresh and try again.",
        );
      }

      // 2. Fetch the Mollie redirect URL and hand the browser over.
      const { data } = await axiosSecure.post("/create-mollie-payment", {
        amount: total,
        orderData,
      });

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Failed to secure checkout URL from Mollie.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Payment failed to initiate, please try again.";
      setErr(errorMsg);
      toast.error(errorMsg);
    }

    setProcessing(false);
  };

  const categoryOptions = [
    { value: "", label: "Select a category...", disabled: true },
    { value: "photography", label: "Photography" },
    { value: "videography", label: "Videography" },
    { value: "both", label: "Photography & Videography" },
  ];

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* ── Page heading ── */}
        <div className="mb-8">
          <p className="tk-eyebrow text-primary mb-2">Final Step</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight">
            Complete Your Purchase
          </h1>
          <p className="text-sm text-body-text/80 mt-2 font-medium">
            Secure payment via Mollie — your project details are instantly
            saved.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
            {/* ── LEFT COLUMN ── */}
            <div className="space-y-5">
              {/* Contact info */}
              <div className="tk-card p-6 md:p-7">
                <SectionHeader
                  step="1"
                  title="Contact Information"
                  subtitle="We'll send your confirmation & invoice here"
                />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      icon={FaUser}
                      label="Full Name"
                      type="text"
                      placeholder="e.g. John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Field
                      icon={FaEnvelope}
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      value={gmail}
                      onChange={(e) => setGmail(e.target.value)}
                      required={!user?.email}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      icon={FaPhone}
                      label="Phone Number"
                      type="tel"
                      placeholder="+44 7700 000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <SelectField
                      icon={FaCamera}
                      label="Category"
                      options={categoryOptions}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    />
                  </div>
                  <Field
                    icon={FaMapMarkerAlt}
                    label="Address"
                    type="text"
                    placeholder="e.g. 12 Baker Street, London, W1U 3BW"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Payment */}
              <div className="tk-card p-6 md:p-7">
                <SectionHeader
                  step="2"
                  title="Payment Details"
                  subtitle="Complete your payment securely with Mollie"
                />

                <div className="flex items-center flex-wrap gap-2 mb-5">
                  {["iDEAL", "SEPA", "CREDIT CARD", "PAYPAL"].map((brand) => (
                    <div
                      key={brand}
                      className="px-3 py-1.5 rounded-lg border border-line-app bg-app-bg text-[10px] font-bold text-body-text/70 tracking-wider"
                    >
                      {brand}
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-primary/25 bg-primary-tint px-5 py-6">
                  <div className="flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-soft">
                      <FaLock size={18} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="text-ink font-semibold text-base">
                        Secure Mollie Checkout
                      </h4>
                      <p className="text-xs text-body-text/80 font-medium mt-1">
                        You will be securely redirected to Mollie to finalize
                        the payment via your selected gateway.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 pt-4 border-t border-dashed border-line-app">
                  <TrustBadge icon={FaShieldAlt} text="Buyer Protection" />
                  <TrustBadge icon={FaLock} text="SSL Encrypted" />
                  <TrustBadge icon={FaCloudDownloadAlt} text="Instant Delivery" />
                  <TrustBadge icon={FaCheckCircle} text="UK Licensed" />
                </div>

                {err && (
                  <div className="mt-4 flex items-center gap-2.5 text-danger-text text-sm font-semibold bg-danger-bg border border-danger-text/20 px-4 py-3 rounded-xl">
                    <span className="font-black text-base">!</span>
                    <span>{err}</span>
                  </div>
                )}
              </div>

              {/* License notice */}
              <div className="rounded-2xl bg-primary-tint border border-primary/15 p-5">
                <div className="flex items-start gap-3">
                  <FaCheckCircle
                    size={17}
                    className="text-primary shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink mb-1">
                      Standard Commercial License Included
                    </p>
                    <p className="text-xs text-body-text/80 leading-relaxed font-medium">
                      All purchases include a perpetual, non-exclusive license
                      for commercial and editorial use within the UK. Resale,
                      redistribution, or sublicensing is strictly prohibited
                      per Taskra's terms.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Order summary ── */}
            <div className="lg:sticky lg:top-6">
              <div className="tk-card overflow-hidden">
                <div className="bg-primary px-6 py-4 text-center">
                  <h3 className="text-white font-bold text-lg">
                    Order Summary
                  </h3>
                  <p className="text-white/80 text-xs mt-0.5 font-medium">
                    Project payment details
                  </p>
                </div>

                <div className="p-5 space-y-5">
                  {/* Project details */}
                  {projectPrice ? (
                    <div className="rounded-2xl border border-line-app bg-app-bg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        {projectPrice.clientPhoto ? (
                          <img
                            src={projectPrice.clientPhoto}
                            alt={projectPrice.clientName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-tint flex items-center justify-center border-2 border-primary/20">
                            <FaUser size={14} className="text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {projectPrice.clientName}
                          </p>
                          <p className="text-xs text-body-text/70 font-medium">
                            Client
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FaProjectDiagram
                          size={12}
                          className="text-primary mt-0.5 shrink-0"
                        />
                        <p className="text-xs text-body-text/80 font-medium line-clamp-2">
                          {projectPrice.requirement}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <FaCalendarAlt
                          size={11}
                          className="text-primary shrink-0"
                        />
                        <span className="text-xs text-body-text/80 font-medium">
                          Timeline:{" "}
                          {new Date(projectPrice.timeline).toLocaleDateString(
                            "en-GB",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-line-app p-6 text-center">
                      <FaImage
                        size={24}
                        className="text-body-text/30 mx-auto mb-2"
                      />
                      <p className="text-xs text-body-text/70 font-medium">
                        Project details not found
                      </p>
                    </div>
                  )}

                  <div className="border-t border-dashed border-line-app pt-5 space-y-4">
                    {/* Price breakdown */}
                    <div className="space-y-2.5 text-sm font-medium">
                      <div className="flex justify-between text-body-text">
                        <span>Project Price</span>
                        <span className="font-semibold text-ink">
                          £{subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-body-text">
                        <span>Platform fee</span>
                        <span className="text-primary font-bold">Free</span>
                      </div>
                      <div className="flex justify-between text-body-text">
                        <span>VAT (20%)</span>
                        <span className="font-semibold text-ink">Included</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-3 border-t border-line-app">
                      <span className="text-base font-semibold text-ink">
                        Total
                      </span>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-ink">
                          £{total.toFixed(2)}
                        </p>
                        <p className="text-xs text-body-text/70 font-medium mt-0.5">
                          inc. VAT · GBP
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pay button */}
                  <button
                    type="submit"
                    disabled={processing || !projectPrice}
                    className="tk-btn-primary w-full h-12 text-sm"
                  >
                    {processing ? (
                      <>
                        <FaLock size={13} className="animate-pulse" />
                        Generating Payment Link...
                      </>
                    ) : (
                      <>
                        <FaLock size={13} />
                        Pay £{total.toFixed(2)} Securely
                        <FaArrowRight size={13} />
                      </>
                    )}
                  </button>

                  {/* Footer */}
                  <div className="text-center space-y-2.5">
                    <p className="text-xs text-body-text/70 font-medium leading-relaxed">
                      By purchasing, you agree to Taskra's{" "}
                      <span className="text-primary font-semibold cursor-pointer hover:underline">
                        Terms of Service
                      </span>{" "}
                      &amp;{" "}
                      <span className="text-primary font-semibold cursor-pointer hover:underline">
                        Licensing Agreement
                      </span>
                      .
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <TrustBadge icon={FaShieldAlt} text="Secure" />
                      <TrustBadge
                        icon={FaCloudDownloadAlt}
                        text="Instant Access"
                      />
                      <TrustBadge icon={FaCheckCircle} text="UK Licensed" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
