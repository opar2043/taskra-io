import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

/**
 * First-visit intro overlay for dashboard pages.
 * Shows once per `componentName` (persisted in localStorage).
 *
 * <TutorialModal
 *   componentName="my-jobs"
 *   title="Your Jobs"
 *   description="Track every job you've posted."
 *   listItems={["Post a job", "Review proposals", "Hire with confidence"]}
 * />
 */
const TutorialModal = ({ componentName, title, description, listItems = [] }) => {
  const storageKey = `tutorial-seen-${componentName}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (componentName && !localStorage.getItem(storageKey)) {
      setOpen(true);
    }
  }, [componentName, storageKey]);

  const dismiss = () => {
    localStorage.setItem(storageKey, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismiss}
        >
          <motion.div
            className="tk-card w-full max-w-md p-8 relative"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "tween", duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="tk-icon-btn absolute top-4 right-4" onClick={dismiss} aria-label="Close">
              <FiX size={18} />
            </button>
            <span className="tk-eyebrow">Quick tour</span>
            <h3 className="text-xl font-semibold text-ink mt-1 mb-2">{title}</h3>
            {description && <p className="text-sm text-body-text mb-4">{description}</p>}
            {listItems.length > 0 && (
              <ul className="space-y-2 mb-6">
                {listItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink">
                    <span className="w-5 h-5 rounded-full bg-primary-tint text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <button className="tk-btn-primary w-full" onClick={dismiss}>
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialModal;
