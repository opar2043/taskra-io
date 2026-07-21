import { FiBookOpen, FiShield } from "react-icons/fi";
import useLoginUser from "../../../Hooks/useLoginUser";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const DocsAdmin = () => {
  const { currentUser } = useLoginUser();

  if (currentUser?.role !== "admin" && currentUser?.role !== "owner") {
    return (
      <div className="flex items-center justify-center p-10">
        <span className="tk-badge-error text-sm px-4 py-2">Access Denied. Admins Only.</span>
      </div>
    );
  }

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="DocsAdmin"
        title="Welcome to Platform Documentation"
        description="Your internal knowledge base for how the platform operates."
        listItems={[
          "Review role permissions and capabilities",
          "Follow core platform workflows",
          "Reference operational procedures anytime",
        ]}
      />

      {/* Header */}
      <div className="tk-card p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
            <FiBookOpen size={20} />
          </div>
          <div>
            <h1 className="tk-page-title">Platform Documentation</h1>
            <p className="tk-eyebrow mt-0.5">Taskra Internal Knowledge Base</p>
          </div>
        </div>
        <span className="tk-badge-info flex items-center gap-2 px-3 py-2 text-xs">
          <FiShield size={13} /> Admin Access Only
        </span>
      </div>

      {/* Body */}
      <div className="tk-card p-6 md:p-8 space-y-8 text-ink">
        <section>
          <h2 className="text-xl font-semibold text-ink border-b border-line-app pb-3 mb-4">
            Welcome to Taskra (Admin Docs)
          </h2>
          <p className="leading-relaxed text-sm text-body-text">
            This is the official Taskra systems operation manual. Taskra acts as a connective
            CRM bridging clients and professional creatives. Below you will find the standard
            operational procedures for user lifecycles, database structures, and platform
            workflows.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink mb-3">
            1. Role Permissions &amp; Capabilities
          </h2>
          <ul className="space-y-4">
            <li className="bg-app-bg p-4 rounded-xl border border-line-app">
              <strong className="text-ink text-sm">Clients (Buyers):</strong>
              <p className="text-sm text-body-text mt-1">
                Navigate the global professional pool, post creative jobs via{" "}
                <code className="text-xs bg-primary-tint text-primary px-1.5 py-0.5 rounded">
                  /post-job
                </code>
                , evaluate incoming proposals with flat-rate or tiered packages, and authorize
                payments at checkout. Can save profiles and jobs to shortlists.
              </p>
            </li>
            <li className="bg-app-bg p-4 rounded-xl border border-line-app">
              <strong className="text-ink text-sm">Professionals (Sellers):</strong>
              <p className="text-sm text-body-text mt-1">
                Configure highly active profiles containing visual portfolios, youtube reels,
                standard service tiers, bio links, and business contact points. Interact
                natively with job postings and transition won bids onto the "Lead Pipeline"
                Kanban board.
              </p>
            </li>
            <li className="bg-primary-tint p-4 rounded-xl border border-primary/20">
              <strong className="text-primary text-sm">Admins (Oversight):</strong>
              <p className="text-sm text-ink mt-1">
                Manage the ecosystem. Utilize dashboards to override account roles, verify
                (grant badges) to complete professionals, manage pricing matrices, manipulate
                standard FAQs, monitor global analytical metrics, and inject directly into
                client-professional chat channels if intervention is needed.
              </p>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-ink mb-3">2. Core Platform Workflows</h2>

          <div className="space-y-4">
            <div className="border border-line-app p-4 rounded-xl">
              <h3 className="font-semibold text-ink text-sm mb-2">Job Interaction Protocol</h3>
              <div className="text-sm text-body-text pl-4 border-l-2 border-primary space-y-2">
                <p>
                  <strong className="text-ink">1. Initiation:</strong> Client publishes
                  constraints &amp; budget for a required job.
                </p>
                <p>
                  <strong className="text-ink">2. Bid Generation:</strong> Professional
                  navigates to the job, writes a cover letter, and selects either a singular
                  Flat Rate or imports their bespoke "Interactive Tier Packages".
                </p>
                <p>
                  <strong className="text-ink">3. Negotiation:</strong> Client uses system
                  endpoints to message the professional in real-time, facilitated by Express
                  WebSockets.
                </p>
              </div>
            </div>

            <div className="border border-line-app p-4 rounded-xl">
              <h3 className="font-semibold text-ink text-sm mb-2">
                Payment Completion Protocol
              </h3>
              <div className="text-sm text-body-text pl-4 border-l-2 border-ink space-y-2">
                <p>
                  <strong className="text-ink">1. Acceptance:</strong> Client clicks explicitly
                  "Accept" on a Professional's quote card.
                </p>
                <p>
                  <strong className="text-ink">2. Escrow Bridge:</strong> The platform redirects
                  the client into the secured hosted checkout environment.
                </p>
                <p>
                  <strong className="text-ink">3. Dispatch:</strong> Post-authorization,
                  internal state mutates linking transaction IDs to order tables inside
                  MongoDB. Job updates to "In Progress".
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DocsAdmin;
