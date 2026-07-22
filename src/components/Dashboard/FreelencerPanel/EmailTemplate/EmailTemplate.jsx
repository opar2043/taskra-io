import React, { useState, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiSave,
  FiMail,
  FiChevronRight,
  FiEdit3,
  FiSettings,
  FiClock,
  FiCode,
  FiX,
  FiTag,
} from "react-icons/fi";
import useLoginUser from "../../../Hooks/useLoginUser";
import useJobs from "../../../Hooks/useJobs";
import useAxios from "../../../Hooks/useAxios";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

// TODO: backend route missing — persist email templates. Templates currently
// live in component state only (mirroring pixlo-frontend); edits and new
// templates are lost on reload. Add a templates collection + routes to persist.

/* {{token}} groups for the insert dropdown */
const tokenGroups = [
  {
    group: "Client",
    tokens: [{ label: "Client Name", token: "{{client_name}}" }],
  },
  {
    group: "Project",
    tokens: [
      { label: "Project Type", token: "{{project_type}}" },
      { label: "Project Name", token: "{{project_name}}" },
      { label: "Project Date", token: "{{project_date}}" },
      { label: "Project Time", token: "{{project_time}}" },
      { label: "Job Location", token: "{{job_location}}" },
      { label: "Contract Link", token: "{{contract_link}}" },
      { label: "Quote Link", token: "{{quote_link}}" },
      { label: "Invoice Link", token: "{{invoice_link}}" },
      { label: "Invoice Amount", token: "{{invoice_amount_due}}" },
      { label: "Invoice Due Date", token: "{{invoice_due_date}}" },
      { label: "Questionnaire Link", token: "{{questionnaire_link}}" },
      { label: "Portal Link", token: "{{portal_link}}" },
      { label: "Gallery Link", token: "{{gallery_link}}" },
      { label: "Review Link", token: "{{review_link}}" },
    ],
  },
  {
    group: "Business",
    tokens: [
      { label: "My Name", token: "{{my_name}}" },
      { label: "Studio Name", token: "{{studio_name}}" },
    ],
  },
];

const EmailTemplate = () => {
  const { currentUser } = useLoginUser() || {};
  const axiosPublic = useAxios();
  const [activeTab, setActiveTab] = useState("edit"); // edit | preview | history
  const quillRef = useRef(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRawEditor, setIsRawEditor] = useState(false);
  const [sentHistory, setSentHistory] = useState([]);

  // Sender identity settings (persisted to localStorage). Stored overrides
  // live in state; effective values fall back to the logged-in user's details
  // at render time — no effect needed.
  const [showSettings, setShowSettings] = useState(false);
  const [storedSettings, setStoredSettings] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("emailSenderSettings") || "null") || {}
      );
    } catch {
      return {};
    }
  });

  const settings = {
    senderName: storedSettings.senderName || currentUser?.name || "",
    studioName: storedSettings.studioName || currentUser?.studioName || "",
    senderEmail: storedSettings.senderEmail || currentUser?.email || "",
    replyTo: storedSettings.replyTo || currentUser?.email || "",
  };

  const updateSetting = (key, value) =>
    setStoredSettings((p) => ({ ...p, [key]: value }));

  const handleSaveSettings = () => {
    if (settings.senderEmail && !settings.senderEmail.includes("@")) {
      toast.error("Please enter a valid sender email address!");
      return;
    }
    localStorage.setItem("emailSenderSettings", JSON.stringify(settings));
    toast.success("Sender settings saved!");
    setShowSettings(false);
  };

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Auto-Responder for New Inquiries",
      subject: "Thanks for your inquiry, {{client_name}}!",
      body: "Hi {{client_name}},\n\nThank you so much for reaching out about your {{project_type}} project! I have received your message and will get back to you within 24-48 hours.\n\nIn the meantime, feel free to check out my recent work on my website or social media.\n\nBest,\n{{my_name}}\n{{studio_name}}",
      category: "Lead Generation",
      lastModified: "System Default",
    },
    {
      id: 2,
      name: "Lead Follow-Up (Soft)",
      subject: "Checking in on your {{project_type}} inquiry",
      body: "Hi {{client_name}},\n\nI hope you're having a great week! I'm just following up on your inquiry regarding {{project_type}} services.\n\nDid you have any questions about the packages I sent over? Let me know if you'd like to schedule a quick call to chat about your vision.\n\nCheers,\n{{my_name}}",
      category: "Lead Generation",
      lastModified: "System Default",
    },
    {
      id: 3,
      name: "New Quote / Proposal",
      subject: "Your Quote from {{studio_name}}",
      body: "Hi {{client_name}},\n\nIt was great chatting with you! I've put together a custom quote for your {{project_name}}.\n\nYou can view and accept your quote here: {{quote_link}}\n\nPlease let me know if you have any questions.\n\nThanks,\n{{my_name}}",
      category: "Core System",
      lastModified: "System Default",
    },
    {
      id: 4,
      name: "New Contract / Agreement",
      subject: "Contract for {{project_name}}",
      body: "Hi {{client_name}},\n\nWe are almost there! To finalize your booking for {{project_name}}, please review and sign the contract using the link below:\n\n{{contract_link}}\n\nOnce signed, your date will be officially reserved. Let me know if you have any questions about the agreement.\n\nBest,\n{{my_name}}",
      category: "Core System",
      lastModified: "System Default",
    },
    {
      id: 5,
      name: "New Invoice",
      subject: "Invoice for {{project_name}}",
      body: "Hi {{client_name}},\n\nThis is a notification that a new invoice for {{invoice_amount_due}} is ready for your {{project_name}} project. The due date is {{invoice_due_date}}.\n\nYou can view and pay your invoice securely online here:\n{{invoice_link}}\n\nThank you for your business!\n\nBest,\n{{my_name}}",
      category: "Core System",
      lastModified: "System Default",
    },
    {
      id: 6,
      name: "Payment Receipt",
      subject: "Payment Received - Thank You!",
      body: "Hi {{client_name}},\n\nThis email is to confirm that we have received your payment of {{invoice_amount_due}} for {{project_name}}.\n\nThank you so much! You can view your updated portal here: {{portal_link}}\n\nBest,\n{{my_name}}",
      category: "Core System",
      lastModified: "System Default",
    },
    {
      id: 7,
      name: "Booking Confirmation",
      subject: "You are officially booked! 🎉",
      body: "Hello {{client_name}},\n\nGreat news! Your contract is signed and the retainer is paid. Your booking for {{project_name}} on {{project_date}} at {{job_location}} is now officially confirmed!\n\nI'm so excited to work with you. I will be sending over some additional information soon.\n\nCheers,\n{{my_name}}",
      category: "Booking & Onboarding",
      lastModified: "System Default",
    },
    {
      id: 8,
      name: "Questionnaire Link",
      subject: "Please complete your project questionnaire",
      body: "Hi {{client_name}},\n\nTo help me prepare for our upcoming {{project_name}}, please take a few minutes to fill out this questionnaire:\n\n{{questionnaire_link}}\n\nThis will give me all the details I need to make sure everything goes perfectly.\n\nThanks,\n{{my_name}}",
      category: "Core System",
      lastModified: "System Default",
    },
    {
      id: 9,
      name: "Session Reminder",
      subject: "Reminder: Upcoming session on {{project_date}}!",
      body: "Hi {{client_name}},\n\nThis is a quick reminder that our session for {{project_name}} is coming up on {{project_date}} at {{job_location}}.\n\nI'm looking forward to it! If you have any last-minute questions, just hit reply.\n\nSee you soon,\n{{my_name}}",
      category: "Pre-Session",
      lastModified: "System Default",
    },
    {
      id: 10,
      name: "Final Gallery Delivery",
      subject: "Your photos are ready! 📸",
      body: "Hi {{client_name}},\n\nThe wait is over! Your final gallery for {{project_name}} is ready to view and download.\n\nYou can access your gallery here: {{gallery_link}}\n\nI hope you love these images as much as I loved capturing them. \n\nBest,\n{{my_name}}",
      category: "Post-Session",
      lastModified: "System Default",
    },
    {
      id: 11,
      name: "Review & Feedback Request",
      subject: "How did I do? {{client_name}}",
      body: "Hi {{client_name}},\n\nIt was such a pleasure working on {{project_name}} with you! \n\nIf you have a moment, I would truly appreciate it if you could leave a review. Your feedback helps my small business grow.\n\nLeave a review here: {{review_link}}\n\nThank you again for choosing {{studio_name}}!\n\n{{my_name}}",
      category: "Marketing",
      lastModified: "System Default",
    },
    {
      id: 12,
      name: "Commercial Videographer – Initial Response",
      subject: "Thank You For Your Enquiry",
      body: "Hi {{client_name}},\n\nThank you for reaching out.\n\nWe'd love to learn more about your project and discuss how we can create compelling video content that helps achieve your business goals.\n\nTo help us provide an accurate proposal, please share:\n• Your company name\n• Project objective\n• Target audience\n• Filming location(s)\n• Desired filming date(s)\n• Expected deliverables\n• Any reference videos or examples\n\nOnce we receive these details, we'll prepare a tailored quotation and production plan.\n\nWe look forward to hearing from you.\n\nKind regards,\n{{studio_name}}",
      category: "Commercial",
      lastModified: "System Default",
    },
    {
      id: 13,
      name: "Commercial Proposal Sent",
      subject: "Your Commercial Video Proposal",
      body: "Hi {{client_name}},\n\nThank you for the opportunity to quote for your project.\n\nPlease find your proposal attached, outlining the scope of work, deliverables, production schedule, and investment required.\n\nWe're confident we can create high-quality content that effectively represents your brand and engages your audience.\n\nShould you have any questions or require any amendments, we'd be happy to assist.\n\nWe look forward to working together.\n\nKind regards,\n{{studio_name}}",
      category: "Commercial",
      lastModified: "System Default",
    },
    {
      id: 14,
      name: "Commercial Shoot Confirmation",
      subject: "Commercial Shoot Confirmed",
      body: "Hi {{client_name}},\n\nWe're pleased to confirm your commercial video shoot.\n\nProject Details:\n• Date: {{project_date}}\n• Time: {{project_time}}\n• Location: {{job_location}}\n• Production Type: {{project_type}}\n\nOur team will arrive prepared and ready to ensure the production runs smoothly and efficiently.\n\nIf there are any updates, access requirements, or changes before the shoot, please let us know as soon as possible.\n\nWe look forward to bringing your vision to life.\n\nKind regards,\n{{studio_name}}",
      category: "Commercial",
      lastModified: "System Default",
    },
    {
      id: 15,
      name: "Commercial Video Delivery Email",
      subject: "Your Final Commercial Video Is Ready",
      body: "Hi {{client_name}},\n\nWe're delighted to let you know that your project is now complete.\n\nYou can access your final video files using the link below:\n\n{{gallery_link}}\n\nDeliverables Included:\n• Final edited video\n• Social media versions (if applicable)\n• Optimised export formats\n\nThank you for trusting us with your project. We hope the content delivers excellent results for your business and marketing efforts.\n\nWe look forward to working with you again in the future.\n\nKind regards,\n{{studio_name}}",
      category: "Commercial",
      lastModified: "System Default",
    },
    {
      id: 16,
      name: "Upsell / Retainer Email",
      subject: "Let's Keep Your Content Consistent",
      body: "Hi {{client_name}},\n\nThank you again for choosing us for your recent project.\n\nMany of our clients find that consistent content creation delivers stronger results than one-off campaigns.\n\nWhether you're looking for monthly social media content, regular promotional videos, product launches, or event coverage, we'd be happy to support your ongoing marketing efforts.\n\nIf you'd like to discuss a monthly content package, simply reply to this email and we'll arrange a call.\n\nWe look forward to helping your brand continue to grow.\n\nKind regards,\n{{studio_name}}",
      category: "Commercial",
      lastModified: "System Default",
    },
    {
      id: 17,
      name: "Pre Ceremonial Parties - Initial Enquiry",
      subject: "Thank You For Your Enquiry",
      body: "Hi {{client_name}},\n\nThank you for getting in touch and congratulations on your upcoming celebration!\n\nWe'd love to capture your special pre-wedding event and create memories you'll treasure for years to come.\n\nTo help us provide an accurate quote, could you please share:\n• Event type (Mehndi, Dholki, Bridal Shower, Engagement, Hen Party, etc.)\n• Event date\n• Venue/location\n• Expected number of guests\n• Photography, videography, or both\n• Any special requirements\n\nOnce we have these details, we'll send over a tailored package and quotation.\n\nWe look forward to being part of your celebration.\n\nKind regards,\n{{studio_name}}",
      category: "Pre-ceremonial",
      lastModified: "System Default",
    },
    {
      id: 18,
      name: "Pre Ceremonial Booking Confirmation",
      subject: "Your Event Has Been Confirmed",
      body: "Hi {{client_name}},\n\nWe're delighted to confirm your booking.\n\nEvent Details:\n• Event: {{project_type}}\n• Date: {{project_date}}\n• Time: {{project_time}}\n• Venue: {{job_location}}\n\nOur team is excited to capture all the special moments, details, and memories from your celebration.\n\nIf there are any updates, timeline changes, or special requests before the event, please let us know and we'll be happy to assist.\n\nThank you for choosing us to be part of your special occasion.\n\nKind regards,\n{{studio_name}}",
      category: "Pre-ceremonial",
      lastModified: "System Default",
    },
    {
      id: 19,
      name: "Pre Ceremonial Gallery Delivery",
      subject: "Relive Your Special Day – Your Gallery Is Here",
      body: "Hi {{client_name}},\n\nWe're excited to let you know that your photos and videos are now ready.\n\nYou can access your gallery using the link below:\n\n{{gallery_link}}\n\nIt was a pleasure capturing your celebration, and we hope the photos and videos allow you to relive these special moments for years to come.\n\nIf you enjoyed working with us, we'd greatly appreciate a review or recommendation to family and friends.\n\nThank you once again for choosing us and we wish you all the best for your upcoming wedding celebrations.\n\nKind regards,\n{{studio_name}}",
      category: "Pre-ceremonial",
      lastModified: "System Default",
    },
    {
      id: 20,
      name: "Real Estate - Initial Enquiry Response",
      subject: "Thank You For Your Property Enquiry",
      body: "Hi {{client_name}},\n\nThank you for your enquiry.\n\nWe'd be delighted to help showcase your property through professional photography and videography.\n\nTo provide an accurate quote, please share:\n• Property address\n• Property type\n• Number of bedrooms\n• Required services (Photography, Videography, Drone Footage, Floor Plans, Virtual Tour)\n• Preferred shoot date\n\nOnce we receive these details, we'll provide a tailored quotation and availability.\n\nWe look forward to working with you.\n\nKind regards,\n{{studio_name}}",
      category: "Real Estate",
      lastModified: "System Default",
    },
    {
      id: 21,
      name: "Real Estate Shoot Confirmation",
      subject: "Your Property Shoot Has Been Confirmed",
      body: "Hi {{client_name}},\n\nWe're pleased to confirm your property shoot.\n\nProperty Details:\n• Address: {{job_location}}\n• Date: {{project_date}}\n• Time: {{project_time}}\n• Services: {{project_type}}\n\nTo ensure the best possible results, we recommend the property is clean, decluttered, and prepared before our arrival.\n\nIf there are any changes or access instructions, please let us know ahead of the shoot.\n\nWe look forward to showcasing your property.\n\nKind regards,\n{{studio_name}}",
      category: "Real Estate",
      lastModified: "System Default",
    },
    {
      id: 22,
      name: "Property Media Delivery",
      subject: "Your Property Photos & Videos Are Ready",
      body: "Hi {{client_name}},\n\nWe're pleased to let you know that your property media is now ready.\n\nYou can download all files using the link below:\n\n{{gallery_link}}\n\nIncluded:\n• High-resolution property photographs\n• Marketing-ready images\n• Video walkthrough (if purchased)\n• Drone footage (if purchased)\n\nThank you for choosing us. We hope the content helps attract more enquiries and supports a successful sale or rental.\n\nWe look forward to working with you again on future properties.\n\nKind regards,\n{{studio_name}}",
      category: "Real Estate",
      lastModified: "System Default",
    },
    {
      id: 23,
      name: "Social Media Content - Enquiry Response",
      subject: "Thank You For Your Enquiry",
      body: "Hi {{client_name}},\n\nThank you for reaching out.\n\nWe'd love to help create engaging content that showcases your business and strengthens your online presence.\n\nTo help us understand your goals, could you please provide:\n• Business name\n• Industry\n• Social media platforms (Instagram, TikTok, Facebook, LinkedIn, etc.)\n• Content requirements\n• Preferred filming date\n• Any examples or inspiration\n\nOnce we receive these details, we'll prepare a tailored content proposal and quotation.\n\nWe look forward to hearing from you.\n\nKind regards,\n{{studio_name}}",
      category: "Social Media",
      lastModified: "System Default",
    },
    {
      id: 24,
      name: "Content Shoot Confirmation",
      subject: "Your Content Shoot Has Been Confirmed",
      body: "Hi {{client_name}},\n\nWe're excited to confirm your social media content shoot.\n\nProject Details:\n• Business: {{client_name}}\n• Date: {{project_date}}\n• Time: {{project_time}}\n• Location: {{job_location}}\n\nOur goal is to create high-quality content that reflects your brand and helps engage your audience.\n\nIf there are any specific products, promotions, team members, or content ideas you'd like featured, please let us know before the shoot.\n\nWe look forward to working with you.\n\nKind regards,\n{{studio_name}}",
      category: "Social Media",
      lastModified: "System Default",
    },
    {
      id: 25,
      name: "Content Delivery Email",
      subject: "Your Social Media Content Is Ready",
      body: "Hi {{client_name}},\n\nWe're pleased to let you know that your content is now ready.\n\nYou can access and download your files using the link below:\n\n{{gallery_link}}\n\nIncluded:\n• Edited social media videos\n• Short-form content for Reels/TikTok\n• Optimised export formats\n• Additional deliverables (if applicable)\n\nThank you for trusting us with your content creation. We hope these assets help your business attract new customers, increase engagement, and strengthen your brand online.\n\nWe look forward to working with you again soon.\n\nKind regards,\n{{studio_name}}",
      category: "Social Media",
      lastModified: "System Default",
    },
    {
      id: 26,
      name: "Music Video Enquiry Response",
      subject: "Thank You For Your Music Video Enquiry",
      body: "Hi {{client_name}},\n\nThank you for reaching out.\n\nWe're excited to learn more about your music video project and help bring your creative vision to life.\n\nTo provide an accurate quotation, please share:\n• Song title\n• Genre\n• Desired filming date\n• Filming location(s)\n• Creative concept or mood\n• Reference videos (if applicable)\n• Estimated budget\n\nOnce we have these details, we'll prepare a tailored proposal for your project.\n\nWe look forward to hearing from you.\n\nKind regards,\n{{studio_name}}",
      category: "Music Video",
      lastModified: "System Default",
    },
    {
      id: 27,
      name: "Music Video Booking Confirmation",
      subject: "Your Music Video Shoot Has Been Confirmed",
      body: "Hi {{client_name}},\n\nWe're pleased to confirm your music video booking.\n\nProject Details:\n• Song: {{project_name}}\n• Shoot Date: {{project_date}}\n• Location(s): {{job_location}}\n• Call Time: {{project_time}}\n\nOur team is excited to bring your vision to life and create a music video that reflects your style and artistic identity.\n\nIf there are any changes to the concept, locations, or schedule before the shoot, please let us know as soon as possible.\n\nWe look forward to working with you.\n\nKind regards,\n{{studio_name}}",
      category: "Music Video",
      lastModified: "System Default",
    },
    {
      id: 28,
      name: "Music Video Delivery Email",
      subject: "Your Music Video Is Ready",
      body: "Hi {{client_name}},\n\nWe're excited to let you know that your music video is now complete.\n\nYou can download and review the final files using the link below:\n\n{{gallery_link}}\n\nWe hope the final video captures your vision and helps make an impact with your audience.\n\nIf you require any revisions included within your package, please let us know and we'll be happy to assist.\n\nThank you for choosing us, and we look forward to working with you on future projects.\n\nKind regards,\n{{studio_name}}",
      category: "Music Video",
      lastModified: "System Default",
    },
    {
      id: 29,
      name: "Headshot Enquiry Response",
      subject: "Thank You For Your Headshot Enquiry",
      body: "Hi {{client_name}},\n\nThank you for your enquiry.\n\nWe'd be delighted to help you create professional headshots that showcase you at your best.\n\nTo help us recommend the right package, please let us know:\n• Purpose of the headshots (LinkedIn, Corporate, Acting, Modelling, Personal Branding, etc.)\n• Preferred shoot date\n• Location preference (Studio or On-Site)\n• Number of people being photographed\n\nOnce we have these details, we'll send over our availability and a tailored quotation.\n\nWe look forward to hearing from you.\n\nKind regards,\n{{studio_name}}",
      category: "Headshots",
      lastModified: "System Default",
    },
    {
      id: 30,
      name: "Headshot Session Confirmation",
      subject: "Your Headshot Session Has Been Confirmed",
      body: "Hi {{client_name}},\n\nWe're pleased to confirm your headshot session.\n\nSession Details:\n• Date: {{project_date}}\n• Time: {{project_time}}\n• Location: {{job_location}}\n\nTo get the most from your session, we recommend wearing professional attire that reflects your personal brand and arriving a few minutes early.\n\nIf you have any questions before the shoot, please don't hesitate to get in touch.\n\nWe look forward to working with you.\n\nKind regards,\n{{studio_name}}",
      category: "Headshots",
      lastModified: "System Default",
    },
    {
      id: 31,
      name: "Headshot Delivery Email",
      subject: "Your Professional Headshots Are Ready",
      body: "Hi {{client_name}},\n\nWe're pleased to let you know that your headshots are now ready.\n\nYou can access and download your images using the link below:\n\n{{gallery_link}}\n\nWe hope these images help you make a strong first impression and support your professional goals.\n\nThank you for choosing us, and we look forward to working with you again in the future.\n\nKind regards,\n{{studio_name}}",
      category: "Headshots",
      lastModified: "System Default",
    },
    {
      id: 32,
      name: "UGC Enquiry Response",
      subject: "Thank You For Your UGC Content Enquiry",
      body: "Hi {{client_name}},\n\nThank you for your enquiry.\n\nWe'd love to create authentic, engaging content that helps showcase your brand and connect with your target audience.\n\nTo help us prepare a tailored quote, please provide:\n• Brand name\n• Product or service\n• Content type required (UGC Video, Product Demo, Testimonial, Unboxing, TikTok, Reels, etc.)\n• Number of videos required\n• Preferred delivery date\n• Any content brief or examples\n\nOnce we receive these details, we'll send over a proposal and quotation.\n\nWe look forward to working with you.\n\nKind regards,\n{{studio_name}}",
      category: "UGC",
      lastModified: "System Default",
    },
    {
      id: 33,
      name: "UGC Project Confirmation",
      subject: "Your UGC Content Project Has Been Confirmed",
      body: "Hi {{client_name}},\n\nWe're pleased to confirm your UGC content project.\n\nProject Details:\n• Brand: {{client_name}}\n• Content Type: {{project_type}}\n• Deliverables: {{project_name}}\n• Delivery Date: {{project_date}}\n\nWe'll begin planning and producing your content according to the agreed brief.\n\nIf there are any additional requirements, product updates, or creative changes, please let us know before production begins.\n\nWe're excited to create content for your brand.\n\nKind regards,\n{{studio_name}}",
      category: "UGC",
      lastModified: "System Default",
    },
    {
      id: 34,
      name: "UGC Content Delivery Email",
      subject: "Your UGC Content Is Ready",
      body: "Hi {{client_name}},\n\nWe're excited to let you know that your UGC content is now complete.\n\nYou can access and download your content using the link below:\n\n{{gallery_link}}\n\nIncluded:\n• Final edited content\n• Social media ready formats\n• Vertical video exports (TikTok/Reels/Shorts)\n• Additional deliverables as agreed\n\nWe hope the content helps increase engagement, build trust with your audience, and support your marketing goals.\n\nThank you for choosing us, and we look forward to working with you again.\n\nKind regards,\n{{studio_name}}",
      category: "UGC",
      lastModified: "System Default",
    }
  ]);

  const [jobs, , isLoadingJobs] = useJobs();
  const [selectedJob, setSelectedJob] = useState(null);

  const currentTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Resolve a client's display name from any of the fields a job/lead may carry.
  const clientNameOf = (j) =>
    j?.fullName || j?.name || j?.client_name || j?.clientName || "";

  // Only offer jobs that carry a client name and are not completed.
  const clientJobs = (jobs || []).filter(
    (j) => clientNameOf(j) && j.status != "completed",
  );

  const handleUpdateTemplate = (field, value) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplateId ? { ...t, [field]: value } : t
      )
    );
  };

  const handleNewTemplate = () => {
    const id = Date.now();
    setTemplates((prev) => [
      {
        id,
        name: "Untitled Template",
        subject: "",
        body: "",
        category: "Custom",
        lastModified: "Just now",
      },
      ...prev,
    ]);
    setSelectedTemplateId(id);
    setActiveTab("edit");
    toast.success("New template created — start writing!");
  };

  const handleSave = () => {
    // TODO: backend route missing — persist email templates
    toast.success("Template saved for this session!");
  };

  const handleSendEmail = async () => {
    let targetEmail = "";
    let targetName = "";

    if (selectedClient === "manual") {
      if (!manualEmail || !manualEmail.includes("@")) {
        toast.error("Please enter a valid manual email address!");
        return;
      }
      targetEmail = manualEmail;
      targetName = "Valued Client";
    } else {
      if (!selectedJob) {
        toast.error("Please select a client from your records!");
        return;
      }
      targetEmail = selectedJob.email;
      targetName = clientNameOf(selectedJob) || "Client";
    }

    setIsSending(true);
    try {
      const response = await axiosPublic.post("/api/emails/send", {
        clientEmail: targetEmail,
        clientName: targetName,
        subjectTemplate: currentTemplate.subject,
        bodyTemplate: currentTemplate.body,
        freelancerEmail: settings.senderEmail || currentUser?.email,
        replyTo: settings.replyTo || settings.senderEmail || currentUser?.email,
        freelancerName:
          settings.senderName || currentUser?.name || "Taskra Professional",
        studioName:
          settings.studioName || currentUser?.studioName || "Taskra Studio",
        // Pass full job data for server-side token replacement
        jobData: selectedJob,
      });

      if (response.status === 200) {
        toast.success(`Email sent to ${targetName}!`);
        setSentHistory((prev) => [
          {
            id: Date.now(),
            client: targetName,
            subject: currentTemplate.subject,
            date: new Date().toLocaleString(),
            status: "Sent",
          },
          ...prev,
        ]);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Server error. Please try again.";
      toast.error(`Failed: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  const insertToken = (token) => {
    if (!token) return;
    if (isRawEditor) {
      handleUpdateTemplate("body", (currentTemplate.body || "") + token);
      return;
    }
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      if (range) {
        editor.insertText(range.index, token);
        editor.setSelection(range.index + token.length);
        handleUpdateTemplate("body", editor.root.innerHTML);
      }
    }
  };

  /* Live preview — replaces {{tokens}} with the selected job's data or dummies */
  const getPreviewBody = (text) => {
    if (!text) return "";
    let preview = text;

    const clientName =
      clientNameOf(selectedJob) ||
      (selectedClient === "manual" ? "Valued Client" : "Client Name");
    const projectType = selectedJob?.category || "Photography";
    const projectName = selectedJob?.title || "Your Project";
    const projectDate = selectedJob?.eventDate || "15 June 2026";
    const projectTime = selectedJob?.eventTime || "10:00 AM";
    const jobLocation = selectedJob?.location || "Central London";

    preview = preview.replace(/{{client_name}}/g, clientName);
    preview = preview.replace(
      /{{my_name}}/g,
      settings.senderName || currentUser?.name || "Alex Johnson"
    );
    preview = preview.replace(
      /{{studio_name}}/g,
      settings.studioName || currentUser?.studioName || "Taskra Studio"
    );
    preview = preview.replace(/{{project_type}}/g, projectType);
    preview = preview.replace(/{{project_name}}/g, projectName);
    preview = preview.replace(/{{project_date}}/g, projectDate);
    preview = preview.replace(/{{project_time}}/g, projectTime);
    preview = preview.replace(/{{job_location}}/g, jobLocation);

    const refId = selectedJob?._id || "123";
    preview = preview.replace(
      /{{contract_link}}/g,
      `https://taskra.io/contract/${refId}`
    );
    preview = preview.replace(
      /{{quote_link}}/g,
      `https://taskra.io/quote/${refId}`
    );
    preview = preview.replace(
      /{{invoice_link}}/g,
      `https://taskra.io/invoice/${refId}`
    );
    preview = preview.replace(
      /{{invoice_amount_due}}/g,
      selectedJob?.price ? `£${selectedJob.price}` : "£500.00"
    );
    preview = preview.replace(/{{invoice_due_date}}/g, "1 June 2026");
    preview = preview.replace(
      /{{questionnaire_link}}/g,
      `https://taskra.io/form/${refId}`
    );
    preview = preview.replace(
      /{{portal_link}}/g,
      `https://taskra.io/portal/${refId}`
    );
    preview = preview.replace(
      /{{gallery_link}}/g,
      `https://taskra.io/gallery/${refId}`
    );
    preview = preview.replace(/{{review_link}}/g, "https://g.page/taskra/review");

    return preview;
  };

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="EmailTemplate"
        title="Welcome to Email & CRM"
        description="This is where you can manage your email templates and communicate with clients seamlessly."
        listItems={[
          "Select and customize templates",
          "Send emails directly to clients",
          "View your sent history",
        ]}
      />

      <style>{`
        .custom-quill-editor .ql-container {
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          border: none;
          min-height: 320px;
        }
        .custom-quill-editor .ql-toolbar {
          border: none;
          border-bottom: 1px solid #E7E9EE;
          padding: 12px 16px;
          background: #F5F6F8;
          border-radius: 12px 12px 0 0;
        }
        .custom-quill-editor {
          border: 1px solid #E7E9EE;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }
      `}</style>

      {/* Header */}
      <div className="tk-card p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tk-page-title flex items-center gap-2">
            <FiMail className="text-primary" />
            Email & CRM
          </h1>
          <p className="text-sm text-body-text mt-1">
            Select a template, customize it, and send it to your clients
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="tk-btn-secondary"
          >
            <FiSettings /> Settings
          </button>
          <button onClick={handleNewTemplate} className="tk-btn-primary">
            <FiPlus /> New Template
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* -------- Sidebar: template list -------- */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className="flex bg-app-bg p-1 rounded-xl border border-line-app">
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab !== "history"
                  ? "bg-white text-primary shadow-sm"
                  : "text-body-text"
              }`}
            >
              <FiMail /> Templates
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-white text-primary shadow-sm"
                  : "text-body-text"
              }`}
            >
              <FiClock /> Sent History
            </button>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/40" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tk-input pl-10"
            />
          </div>

          <div className="tk-card overflow-hidden">
            <div className="p-4 bg-app-bg/70 border-b border-line-app">
              <h3 className="tk-section-title">Select Template</h3>
            </div>
            <div className="divide-y divide-line-app max-h-[480px] overflow-y-auto">
              {templates
                .filter((t) =>
                  t.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`w-full text-left p-4 hover:bg-app-bg/50 transition-colors flex items-center justify-between group ${
                      selectedTemplateId === template.id
                        ? "bg-primary-tint border-l-4 border-primary"
                        : ""
                    }`}
                  >
                    <div>
                      <h4
                        className={`text-sm font-semibold mb-1 ${
                          selectedTemplateId === template.id
                            ? "text-primary"
                            : "text-ink"
                        }`}
                      >
                        {template.name}
                      </h4>
                      <p className="text-[10px] text-body-text/60 font-semibold uppercase">
                        {template.category}
                      </p>
                    </div>
                    <FiChevronRight
                      className={`text-xs transition-transform ${
                        selectedTemplateId === template.id
                          ? "text-primary translate-x-1"
                          : "text-body-text/30"
                      }`}
                    />
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* -------- Editor pane -------- */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="tk-card flex flex-col h-full overflow-hidden">
            {/* Control bar */}
            <div className="flex flex-col 2xl:flex-row items-stretch 2xl:items-center justify-between px-4 md:px-6 py-4 bg-app-bg/70 border-b border-line-app gap-4">
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <span className="text-xs font-semibold text-body-text/70 uppercase whitespace-nowrap">
                  Send To:
                </span>
                <div className="flex-1 min-w-0 flex flex-col md:flex-row gap-3">
                  <select
                    value={
                      selectedClient === "manual"
                        ? "manual"
                        : selectedJob?._id || ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "manual") {
                        setSelectedClient("manual");
                        setSelectedJob(null);
                      } else if (val === "") {
                        setSelectedClient("");
                        setSelectedJob(null);
                      } else {
                        const job = jobs.find((j) => j._id === val);
                        setSelectedJob(job);
                        setSelectedClient(clientNameOf(job) || "Client");
                      }
                    }}
                    className="tk-input flex-1 min-w-0 sm:min-w-[200px]"
                  >
                    <option value="">
                      {isLoadingJobs ? "Loading clients..." : "Choose a client..."}
                    </option>
                    {clientJobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {clientNameOf(job)} — {job.title}
                      </option>
                    ))}
                    <option value="manual">+ Manual Email Input</option>
                  </select>

                  {selectedClient === "manual" && (
                    <input
                      type="email"
                      placeholder="Enter email address..."
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="tk-input flex-1"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3 sm:justify-end">
                <button
                  onClick={() => setIsRawEditor(!isRawEditor)}
                  className={`tk-btn ${
                    isRawEditor
                      ? "bg-primary-tint text-primary border border-primary/30"
                      : "tk-btn-secondary"
                  }`}
                  title="Toggle Raw HTML Editor"
                >
                  <FiCode /> {isRawEditor ? "Rich Text" : "Raw HTML"}
                </button>
                <button
                  onClick={() =>
                    setActiveTab(activeTab === "edit" ? "preview" : "edit")
                  }
                  className="tk-btn-secondary"
                >
                  {activeTab == "edit" ? (
                    <>
                      <FiEye /> Preview
                    </>
                  ) : (
                    <>
                      <FiEdit3 /> Edit
                    </>
                  )}
                </button>
                <button onClick={handleSave} className="tk-btn-secondary">
                  <FiSave /> Save
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="tk-btn-primary"
                >
                  {isSending ? "Sending..." : "Send Now"}
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 flex-1 flex flex-col min-h-[500px]">
              <AnimatePresence mode="wait">
                {activeTab === "edit" ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 flex-1 flex flex-col"
                  >
                    <input
                      type="text"
                      value={currentTemplate.name}
                      onChange={(e) =>
                        handleUpdateTemplate("name", e.target.value)
                      }
                      className="w-full px-1 text-xs font-semibold uppercase tracking-wide text-body-text/70 outline-none bg-transparent"
                      placeholder="Template name"
                    />
                    <input
                      type="text"
                      value={currentTemplate.subject}
                      onChange={(e) =>
                        handleUpdateTemplate("subject", e.target.value)
                      }
                      className="w-full px-1 py-3 bg-transparent border-b border-line-app focus:border-primary outline-none font-semibold text-lg text-ink transition-colors"
                      placeholder="Email Subject"
                    />

                    <div className="flex-1 flex flex-col mt-2">
                      {isRawEditor ? (
                        <textarea
                          value={currentTemplate.body}
                          onChange={(e) =>
                            handleUpdateTemplate("body", e.target.value)
                          }
                          className="w-full flex-1 p-4 font-mono text-sm border border-line-app rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none bg-app-bg/40 min-h-[320px]"
                          placeholder="Type your RAW HTML or text here..."
                        />
                      ) : (
                        <ReactQuill
                          ref={quillRef}
                          theme="snow"
                          value={currentTemplate.body}
                          onChange={(content) =>
                            handleUpdateTemplate("body", content)
                          }
                          className="w-full flex-1 custom-quill-editor"
                          placeholder="Type your message here..."
                          modules={{
                            toolbar: [
                              [{ header: [1, 2, 3, false] }],
                              ["bold", "italic", "underline", "strike"],
                              [{ list: "ordered" }, { list: "bullet" }],
                              ["link"],
                              ["clean"],
                            ],
                          }}
                        />
                      )}
                    </div>
                  </motion.div>
                ) : activeTab === "preview" ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center p-4 md:p-8 bg-app-bg rounded-2xl overflow-y-auto"
                  >
                    {/* Exact inbox-style preview with tokens replaced */}
                    <div className="w-full max-w-[600px] bg-white rounded-2xl shadow-soft overflow-hidden border border-line-app">
                      <div className="bg-primary p-8 text-center">
                        <h1 className="text-white text-xl md:text-2xl font-bold tracking-wide">
                          {settings.studioName ||
                            currentUser?.studioName ||
                            currentUser?.name ||
                            "Taskra Studio"}
                        </h1>
                      </div>

                      <div className="p-8 md:p-10 min-h-[300px]">
                        <div className="mb-6 pb-4 border-b border-line-app">
                          <p className="tk-section-title mb-1">Subject</p>
                          <p className="text-lg font-semibold text-ink">
                            {getPreviewBody(currentTemplate.subject)}
                          </p>
                        </div>
                        <div
                          className="text-body-text leading-relaxed text-[15px] whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: getPreviewBody(currentTemplate.body),
                          }}
                        />
                      </div>

                      <div className="bg-app-bg/70 p-8 border-t border-line-app text-center">
                        <p className="text-xs text-body-text font-medium">
                          Sent by{" "}
                          <strong>
                            {settings.senderName ||
                              currentUser?.name ||
                              "Professional"}
                          </strong>{" "}
                          via <span className="text-primary font-bold">Taskra</span>
                        </p>
                        <p className="text-[10px] text-body-text/60 mt-1 uppercase">
                          © {new Date().getFullYear()}{" "}
                          {settings.studioName ||
                            currentUser?.studioName ||
                            "Taskra Pro"}
                          . All rights reserved.
                        </p>
                      </div>
                    </div>

                    <p className="mt-6 flex items-center gap-2 text-body-text/70 text-xs">
                      <FiEye className="text-primary" />
                      This is exactly how your client will see the email in their
                      inbox.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="tk-table-wrap">
                      <div className="overflow-x-auto">
                        <table className="tk-table min-w-[520px]">
                          <thead className="tk-thead">
                            <tr>
                              <th className="tk-th">Client</th>
                              <th className="tk-th">Subject</th>
                              <th className="tk-th">Date</th>
                              <th className="tk-th">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sentHistory.length > 0 ? (
                              sentHistory.map((item) => (
                                <tr key={item.id} className="tk-row">
                                  <td className="tk-td font-semibold">
                                    {item.client}
                                  </td>
                                  <td className="tk-td">{item.subject}</td>
                                  <td className="tk-td-muted">{item.date}</td>
                                  <td className="tk-td">
                                    <span className="tk-badge-success">
                                      {item.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="px-4 py-12 text-center text-body-text/60 text-sm italic"
                                >
                                  No emails sent yet in this session.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Token insert dropdown */}
            <div className="px-4 md:px-6 py-4 bg-app-bg/70 border-t border-line-app flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-[11px] font-semibold text-body-text/70 uppercase flex items-center gap-1.5 whitespace-nowrap">
                <FiTag className="text-primary" /> Insert token
              </span>
              <select
                value=""
                onChange={(e) => {
                  insertToken(e.target.value);
                  e.target.value = "";
                }}
                className="tk-input w-full sm:w-64"
              >
                <option value="" disabled>
                  Choose a {"{{token}}"} to insert...
                </option>
                {tokenGroups.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.tokens.map((t) => (
                      <option key={t.token} value={t.token}>
                        {t.label} — {t.token}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-[11px] text-body-text/60">
                Tokens are replaced with real client & project data when the
                email is sent.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* -------- Sender settings modal -------- */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="tk-card w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-line-app bg-app-bg/70">
                <h3 className="text-base font-semibold text-ink flex items-center gap-2">
                  <FiSettings className="text-primary" /> Sender Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="tk-icon-btn"
                >
                  <FiX />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-xs text-body-text -mt-1">
                  These details control how your emails appear to clients. Your
                  reply-to email lets clients respond directly to you.
                </p>

                <div>
                  <label className="tk-label">Your Name</label>
                  <input
                    type="text"
                    value={settings.senderName}
                    onChange={(e) =>
                      updateSetting("senderName", e.target.value)
                    }
                    placeholder="e.g. Alex Johnson"
                    className="tk-input"
                  />
                </div>

                <div>
                  <label className="tk-label">Studio / Business Name</label>
                  <input
                    type="text"
                    value={settings.studioName}
                    onChange={(e) =>
                      updateSetting("studioName", e.target.value)
                    }
                    placeholder="e.g. Alex Photography Studio"
                    className="tk-input"
                  />
                </div>

                <div>
                  <label className="tk-label">Sender Email</label>
                  <input
                    type="email"
                    value={settings.senderEmail}
                    onChange={(e) =>
                      updateSetting("senderEmail", e.target.value)
                    }
                    placeholder="you@yourstudio.com"
                    className="tk-input"
                  />
                </div>

                <div>
                  <label className="tk-label">Reply-To Email</label>
                  <input
                    type="email"
                    value={settings.replyTo}
                    onChange={(e) =>
                      updateSetting("replyTo", e.target.value)
                    }
                    placeholder="Where client replies should go"
                    className="tk-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line-app bg-app-bg/70">
                <button
                  onClick={() => setShowSettings(false)}
                  className="tk-btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleSaveSettings} className="tk-btn-primary">
                  <FiSave /> Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailTemplate;
