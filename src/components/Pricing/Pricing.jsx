import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import useAxios from "../Hooks/useAxios";
import Faq from "../Home/Faq";
import Loading from "../Root/Loading";

// CMS-driven plans (GET /pricing, sorted by priceMonthly asc on the backend).
const Pricing = () => {
  const axiosPublic = useAxios();
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly | yearly
  const [currency, setCurrency] = useState("GBP"); // USD | GBP | AUD

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/pricing");
      return data;
    },
  });

  const currencySymbols = { USD: "$", GBP: "£", AUD: "A$" };
  const sym = currencySymbols[currency];

  // Backend stores base USD values; convert for display.
  const formatPrice = (price) => {
    let multiplier = 1;
    if (currency === "GBP") multiplier = 0.75;
    if (currency === "AUD") multiplier = 1.5;
    return Math.round(price * multiplier);
  };

  const getBooleanIcon = (val) => {
    if (val === "✅" || val === "true" || val === true)
      return <FaCheck className="text-success-text inline" aria-label="Included" />;
    if (val === "❌" || val === "false" || val === false)
      return <FaTimes className="text-danger-text inline" aria-label="Not included" />;
    return <span className="font-medium text-ink">{val}</span>;
  };

  // Standard comparison rows mapped to the fields stored on each plan.
  const standardRows = [
    { label: "Brands", key: "brands" },
    { label: "Team Members", key: "users" },
    { label: "Contact Forms", key: "contactForms" },
    { label: "Active Jobs", key: "activeJobs" },
    { label: "Online Booking", key: "onlineBookingForms" },
    { label: "Workflow Automation", key: "workflowAutomation" },
  ];

  // Union of every custom feature label across all plans (added from the admin panel).
  const customLabels = [
    ...new Set(
      plans.flatMap((p) =>
        (Array.isArray(p.features) ? p.features : []).map((f) => f?.label).filter(Boolean)
      )
    ),
  ];

  const getCustomValue = (plan, label) => {
    const found = (Array.isArray(plan.features) ? plan.features : []).find(
      (f) => f?.label === label
    );
    return found ? found.value : "❌";
  };

  const toggleBtn = (active) =>
    `px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
      active ? "bg-primary text-white shadow-sm" : "text-body-text hover:bg-cream"
    }`;

  return (
    <div className="bg-cream min-h-screen">
      {/* 1. HERO */}
      <section className="relative pt-20 pb-14 md:pt-28 md:pb-16 px-5 md:px-8 max-w-4xl mx-auto text-center overflow-hidden">
        <div className="dot-grid absolute top-10 right-0 w-32 h-32 opacity-40 pointer-events-none hidden lg:block" />
        <span className="mk-eyebrow mb-4 block">Pricing &amp; Plans</span>
        <h1 className="mk-h1 mb-6">
          No credit card, lock-in contract
          <br className="hidden md:block" /> or hidden fees
        </h1>
        <p className="mk-lead !text-base md:!text-lg mb-8">
          Start your 7-day free trial today. No credit card required, no obligations, and
          absolutely no lock-in contracts.
        </p>
        <Link to="/register" className="btn-pill">
          Sign up today
        </Link>
      </section>

      {/* 2. TOGGLES + PLAN CARDS */}
      <section className="py-12 px-5 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="mk-h2 !text-2xl md:!text-3xl mb-3">Pricing and subscriptions</h2>
          <p className="text-body-text text-sm font-medium max-w-xl mx-auto mb-8">
            We'll migrate your current and future jobs at no extra cost. Select the billing
            cycle that fits your business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Currency switcher */}
            <div className="bg-white p-1 rounded-full shadow-soft border border-line flex">
              {["USD", "GBP", "AUD"].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={toggleBtn(currency === curr)}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Billing toggle */}
            <div className="bg-white p-1 rounded-full shadow-soft border border-line flex items-center relative">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={toggleBtn(billingCycle === "monthly")}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`${toggleBtn(billingCycle === "yearly")} relative`}
              >
                Yearly
                <span className="absolute -top-3 -right-2 bg-success-text text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        {isLoading ? (
          <Loading />
        ) : (
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 lg:gap-8">
            {plans.map((plan, i) => {
              const isRecommended = plan.isRecommended;
              const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

              // Card feature list from the plan's stored fields + custom features.
              const baseFeatures = [
                { label: `Up to ${plan.brands} Brand(s)`, included: true },
                { label: `${plan.users} User Seat(s)`, included: true },
                {
                  label: `${
                    plan.activeJobs === "Unlimited" ? "Unlimited" : `Up to ${plan.activeJobs}`
                  } Active Jobs`,
                  included: true,
                },
                { label: `${plan.contactForms} Contact Form(s)`, included: true },
                {
                  label: "Online Booking",
                  included: plan.onlineBookingForms !== "❌",
                  note:
                    plan.onlineBookingForms !== "❌" && plan.onlineBookingForms !== "✅"
                      ? plan.onlineBookingForms
                      : null,
                },
                { label: "Workflow Automation", included: plan.workflowAutomation === "✅" },
              ];
              const customFeatures = (Array.isArray(plan.features) ? plan.features : [])
                .filter((f) => f && f.label)
                .map((f) => ({
                  label: f.label,
                  included: f.value !== "❌" && f.value !== "false" && f.value !== false,
                  note:
                    f.value !== "✅" &&
                    f.value !== "❌" &&
                    f.value !== "true" &&
                    f.value !== "false"
                      ? f.value
                      : null,
                }));
              const cardFeatures = [...baseFeatures, ...customFeatures];

              return (
                <div
                  key={plan._id}
                  className={`flex-1 min-w-[280px] max-w-sm bg-white rounded-3xl flex flex-col transition-all duration-300 relative ${
                    isRecommended
                      ? "border-2 border-primary shadow-soft md:-translate-y-3"
                      : "border border-line shadow-soft hover:-translate-y-1"
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md z-10">
                      ★ Most Popular
                    </div>
                  )}

                  <div className="p-7 flex flex-col h-full">
                    {/* Icon block */}
                    <div
                      className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 text-3xl ${
                        isRecommended ? "bg-primary-tint" : "bg-cream"
                      }`}
                    >
                      {i === 0 && <span>🚀</span>}
                      {i === 1 && <span>⚡</span>}
                      {i === 2 && <span>👑</span>}
                      {i > 2 && <span>✦</span>}
                    </div>

                    <h3 className="text-xs font-bold text-body-text/60 uppercase tracking-widest mb-2">
                      {plan.title} Plan
                    </h3>

                    <div className="mb-1 flex items-baseline">
                      <span className="font-display text-5xl font-semibold text-ink tracking-tight">
                        {sym}
                        {formatPrice(price)}
                      </span>
                      <span className="text-sm font-medium text-body-text ml-1.5">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    </div>
                    {billingCycle === "yearly" && (
                      <p className="text-xs font-semibold text-success-text mb-4">
                        Billed annually — save 17%
                      </p>
                    )}

                    <p className="text-sm text-body-text mt-3 mb-6 font-medium leading-relaxed">
                      Perfect for creatives looking for premium tools and management.
                    </p>

                    <div className="border-t border-line pt-6 mb-8">
                      <ul className="space-y-3.5 flex-1">
                        {cardFeatures.map((feat, fi) => (
                          <li
                            key={fi}
                            className={`flex gap-3 text-sm font-medium ${
                              feat.included ? "text-ink" : "text-body-text/50"
                            }`}
                          >
                            {feat.included ? (
                              <FaCheck className="text-success-text mt-0.5 shrink-0" />
                            ) : (
                              <FaTimes className="text-body-text/30 mt-0.5 shrink-0" />
                            )}
                            <span
                              className={feat.included ? "" : "line-through decoration-line"}
                            >
                              {feat.note ? `${feat.note} ` : ""}
                              {feat.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      to="/register"
                      className={`mt-auto w-full ${
                        isRecommended ? "btn-pill" : "btn-pill-outline"
                      }`}
                    >
                      Select {plan.title}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. FULL FEATURE COMPARISON TABLE */}
      <section className="py-16 md:py-20 px-5 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="mk-h2 !text-2xl md:!text-3xl mb-3">Comparing all plan details</h2>
          <p className="text-sm font-medium text-body-text">
            A robust look at everything included to power your creative business.
          </p>
        </div>

        {plans.length === 0 ? (
          <p className="text-center text-sm text-body-text/60 font-medium">
            No plans available yet.
          </p>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="overflow-x-auto bg-white rounded-2xl border border-line shadow-soft hidden md:block">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-cream">
                    <th className="px-6 py-4 font-bold text-body-text/70 text-xs tracking-wider uppercase border-b border-line">
                      Features
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan._id}
                        className={`px-6 py-4 font-bold text-xs tracking-wider uppercase border-b border-line ${
                          plan.isRecommended ? "text-primary" : "text-body-text/70"
                        }`}
                      >
                        {plan.title}
                        {plan.isRecommended && (
                          <span className="ml-1 normal-case tracking-normal text-[10px]">★</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {standardRows.map((row) => (
                    <tr key={row.key} className="hover:bg-cream/60 transition-colors">
                      <td className="px-6 py-4 text-ink font-medium">{row.label}</td>
                      {plans.map((plan) => (
                        <td
                          key={plan._id}
                          className={`px-6 py-4 ${
                            plan.isRecommended ? "bg-primary-tint/40" : ""
                          }`}
                        >
                          {getBooleanIcon(plan[row.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {customLabels.map((label) => (
                    <tr key={label} className="hover:bg-cream/60 transition-colors">
                      <td className="px-6 py-4 text-ink font-medium">{label}</td>
                      {plans.map((plan) => (
                        <td
                          key={plan._id}
                          className={`px-6 py-4 ${
                            plan.isRecommended ? "bg-primary-tint/40" : ""
                          }`}
                        >
                          {getBooleanIcon(getCustomValue(plan, label))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked comparison */}
            <div className="md:hidden space-y-5">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className={`bg-white rounded-2xl border shadow-soft overflow-hidden ${
                    plan.isRecommended ? "border-primary" : "border-line"
                  }`}
                >
                  <div
                    className={`px-5 py-3 font-bold text-sm uppercase tracking-wider ${
                      plan.isRecommended
                        ? "bg-primary-tint text-primary"
                        : "bg-cream text-ink"
                    }`}
                  >
                    {plan.title} {plan.isRecommended && "★"}
                  </div>
                  <ul className="divide-y divide-line">
                    {standardRows.map((row) => (
                      <li
                        key={row.key}
                        className="flex items-center justify-between px-5 py-3 text-sm"
                      >
                        <span className="text-body-text font-medium">{row.label}</span>
                        <span>{getBooleanIcon(plan[row.key])}</span>
                      </li>
                    ))}
                    {customLabels.map((label) => (
                      <li
                        key={label}
                        className="flex items-center justify-between px-5 py-3 text-sm"
                      >
                        <span className="text-body-text font-medium">{label}</span>
                        <span>{getBooleanIcon(getCustomValue(plan, label))}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* 4. FAQ */}
      <Faq />
    </div>
  );
};

export default Pricing;
