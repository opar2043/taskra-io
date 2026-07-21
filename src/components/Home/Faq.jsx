import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../Hooks/useAxios";
import { FaChevronDown } from "react-icons/fa";

// CMS-managed FAQ accordion (GET /faqs). Also embedded at the bottom of Pricing.
const Faq = () => {
  const axiosPublic = useAxios();
  const [openId, setOpenId] = useState(null);

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["home-faqs"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/faqs");
      return data;
    },
  });

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  if (isLoading || faqs.length === 0) return null;

  return (
    <section className="relative py-20 md:py-24 bg-cream overflow-hidden">
      <div className="dot-grid absolute top-10 right-10 w-32 h-32 opacity-40 pointer-events-none hidden lg:block" />

      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <div className="text-center mb-12">
          <span className="mk-eyebrow mb-3 block">Support</span>
          <h2 className="mk-h2 mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="mk-lead !text-base md:!text-lg">
            Have questions? We're here to help. Explore our most common inquiries below.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq._id}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                openId === faq._id
                  ? "border-primary/40 shadow-soft"
                  : "border-line hover:border-primary/30"
              }`}
            >
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 outline-none"
                onClick={() => toggleFaq(faq._id)}
              >
                <span
                  className={`font-semibold text-base md:text-lg transition-colors ${
                    openId === faq._id ? "text-primary" : "text-ink"
                  }`}
                >
                  {faq.question}
                </span>
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    openId === faq._id
                      ? "bg-primary text-white rotate-180"
                      : "bg-cream text-body-text"
                  }`}
                >
                  <FaChevronDown className="text-sm" />
                </div>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out px-6 ${
                  openId === faq._id
                    ? "max-h-[500px] pb-6 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <p className="text-body-text leading-relaxed pt-2 border-t border-line mt-2">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
