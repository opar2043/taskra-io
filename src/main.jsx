import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "./index.css";

import Root from "./components/Root/Root";
import Error from "./components/Root/Error";
import AuthProvider from "./components/Firebase/AuthProvider";

// ---- Public site ----------------------------------------------------------
import Home from "./components/Home/Home";
import AboutSection from "./components/Home/AboutSection";
import About from "./components/Root/About";
import Pricing from "./components/Pricing/Pricing";
import Contact from "./components/Contact/Contact";
import AllFreelenceJob from "./components/Jobs/AllFreelenceJob";
import ViewJobs from "./components/Jobs/ViewJobs";
import ViewFreelencer from "./components/Freelencer/ViewFreelencer";
import SearchFreelencer from "./components/Freelencer/SearchFreelencer";
import Professional from "./components/Professional/Professional";
import Login from "./components/Firebase/Login";
import Register from "./components/Firebase/Register";
import Payment from "./components/payments/Payment";
import Confirm from "./components/payments/Confirm";
import PublicQuestionnaire from "./components/Dashboard/FreelencerPanel/Questionnaire/PublicQuestionnaire";

// ---- Dashboard ------------------------------------------------------------
import Dashboard from "./components/Dashboard/Dashboard";
import AllThing from "./components/Dashboard/AllThing";
import Calender from "./components/Dashboard/Profile/Calender";
import Profile from "./components/Dashboard/Profile/Profile";
import Setting from "./components/Dashboard/Profile/Setting";
import Invoice from "./components/Dashboard/SharedPanel/Invoice";

// client
import PostJob from "./components/Dashboard/ClientPanel/Jobs/PostJob";
import MyJobs from "./components/Dashboard/ClientPanel/Jobs/MyJobs";
import EditJobs from "./components/Dashboard/ClientPanel/Jobs/EditJobs";
import ActiveJobs from "./components/Dashboard/ClientPanel/ActiveJobs/ActiveJobs";
import FindFreelencer from "./components/Dashboard/ClientPanel/FreelenceQuery/FindFreelencer";
import SaveFreelence from "./components/Dashboard/ClientPanel/FreelenceQuery/SaveFreelence";

// professional
import BrowseJob from "./components/Dashboard/FreelencerPanel/BrowseJob/BrowseJob";
import SaveJobs from "./components/Dashboard/FreelencerPanel/BrowseJob/SaveJobs";
import Proposal from "./components/Dashboard/FreelencerPanel/Proposal/Proposal";
import PipelineBoard from "./components/Dashboard/FreelencerPanel/Projects/PipelineBoard";
import PendingProject from "./components/Dashboard/FreelencerPanel/Projects/PendingProject";
import CompleteProject from "./components/Dashboard/FreelencerPanel/Projects/CompleteProject";
import Agreements from "./components/Dashboard/FreelencerPanel/Agreements/Agreements";
import Questionnaires from "./components/Dashboard/FreelencerPanel/Questionnaire/Questionnaires";
import EmailTemplate from "./components/Dashboard/FreelencerPanel/EmailTemplate/EmailTemplate";
import Earning from "./components/Dashboard/FreelencerPanel/EarningFreelence/Earning";

// admin
import Analytics from "./components/Dashboard/AdminPanel/Analytics/Analytics";
import AdminJobs from "./components/Dashboard/AdminPanel/AdminJobs/AdminJobs";
import AllBid from "./components/Dashboard/AdminPanel/AdminJobs/AllBid";
import ClientUser from "./components/Dashboard/AdminPanel/UserManagment/ClientUser";
import FreelencerUser from "./components/Dashboard/AdminPanel/UserManagment/FreelencerUser";
import Orders from "./components/Dashboard/AdminPanel/Orders/Orders";
import Transactions from "./components/Dashboard/AdminPanel/Orders/Transactions";
import DocsAdmin from "./components/Dashboard/AdminPanel/AdminSetting/DocsAdmin";
import FaqAdmin from "./components/Dashboard/AdminPanel/AdminSetting/FaqAdmin";
import PricingAdmin from "./components/Dashboard/AdminPanel/AdminSetting/PricingAdmin";
import FeaturedCreativesAdmin from "./components/Dashboard/AdminPanel/AdminSetting/FeaturedCreativesAdmin";
import HowItWorksAdmin from "./components/Dashboard/AdminPanel/AdminSetting/HowItWorksAdmin";

// chat
import ChatLayout from "./components/Chat/ChatLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime 0 so navigating to any page revalidates against the server —
      // a change made on one page shows up immediately on another (no 5-min lag).
      staleTime: 0,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about-us", element: <AboutSection /> },
      { path: "/about", element: <About /> },
      { path: "/pricing", element: <Pricing /> },
      { path: "/contact", element: <Contact /> },
      { path: "/view-alljobs", element: <AllFreelenceJob /> },
      { path: "/view-jobs/:id", element: <ViewJobs /> },
      { path: "/view-freelencer/:id", element: <ViewFreelencer /> },
      { path: "/search-professional", element: <SearchFreelencer /> },
      { path: "/professional", element: <Professional /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/payment/:id", element: <Payment /> },
      { path: "/payment-success", element: <Confirm /> },
      { path: "/questionnaire/:id", element: <PublicQuestionnaire /> },
    ],
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    errorElement: <Error />,
    children: [
      { path: "/dashboard", element: <AllThing /> },
      { path: "/dashboard/calender", element: <Calender /> },
      { path: "/dashboard/profile", element: <Profile /> },
      { path: "/dashboard/invoice", element: <Invoice /> },
      { path: "/dashboard/settings/:profile", element: <Setting /> },
      // client
      { path: "/dashboard/post-job", element: <PostJob /> },
      { path: "/dashboard/my-jobs", element: <MyJobs /> },
      { path: "/dashboard/edit-job/:id", element: <EditJobs /> },
      { path: "/dashboard/active-projects", element: <ActiveJobs /> },
      { path: "/dashboard/find-freelancers", element: <FindFreelencer /> },
      { path: "/dashboard/saved-freelancers", element: <SaveFreelence /> },
      // professional
      { path: "/dashboard/browse-jobs", element: <BrowseJob /> },
      { path: "/dashboard/saved-jobs", element: <SaveJobs /> },
      { path: "/dashboard/my-proposals", element: <Proposal /> },
      { path: "/dashboard/pipeline", element: <PipelineBoard /> },
      { path: "/dashboard/pending-projects", element: <PendingProject /> },
      { path: "/dashboard/completed-projects", element: <CompleteProject /> },
      { path: "/dashboard/agreements", element: <Agreements /> },
      { path: "/dashboard/questionnaires", element: <Questionnaires /> },
      { path: "/dashboard/email-templates", element: <EmailTemplate /> },
      { path: "/dashboard/earnings", element: <Earning /> },
      // admin
      { path: "/dashboard/analytics", element: <Analytics /> },
      { path: "/dashboard/all-jobs", element: <AdminJobs /> },
      { path: "/dashboard/bids", element: <AllBid /> },
      { path: "/dashboard/clients", element: <ClientUser /> },
      { path: "/dashboard/freelancers", element: <FreelencerUser /> },
      { path: "/dashboard/orders", element: <Orders /> },
      { path: "/dashboard/transactions", element: <Transactions /> },
      { path: "/dashboard/docs", element: <DocsAdmin /> },
      { path: "/dashboard/faqs", element: <FaqAdmin /> },
      { path: "/dashboard/pricing-admin", element: <PricingAdmin /> },
      { path: "/dashboard/featured-creatives", element: <FeaturedCreativesAdmin /> },
      { path: "/dashboard/how-it-works", element: <HowItWorksAdmin /> },
    ],
  },
  {
    path: "/chat/:id",
    element: <ChatLayout />,
    errorElement: <Error />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
