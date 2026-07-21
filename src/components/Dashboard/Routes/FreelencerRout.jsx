import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaChartLine,
  FaUser,
  FaBriefcase,
  FaFileContract,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaEnvelope,
  FaUserCircle,
  FaCog,
  FaCalendarAlt,
} from "react-icons/fa";

const FreelencerRout = ({ currentUser }) => (
  <>
    {/* Overview */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Overview</h3>
      <NavLink to="/dashboard" end className="tk-nav-link">
        <FaTachometerAlt className="tk-nav-icon" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/dashboard/earnings" className="tk-nav-link">
        <FaChartLine className="tk-nav-icon" />
        <span>Earnings</span>
      </NavLink>
      <NavLink to="/dashboard/calender" className="tk-nav-link">
        <FaCalendarAlt className="tk-nav-icon" />
        <span>Calendar</span>
      </NavLink>
      <NavLink to="/search-professional" className="tk-nav-link">
        <FaUser className="tk-nav-icon" />
        <span>Connect Professionals</span>
      </NavLink>
    </div>

    {/* Jobs Posting */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Jobs Posting</h3>
      <NavLink to="/dashboard/my-jobs" className="tk-nav-link">
        <FaBriefcase className="tk-nav-icon" />
        <span>Post a Job</span>
      </NavLink>
    </div>

    {/* Find Work */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Find Work</h3>
      <NavLink to="/dashboard/browse-jobs" className="tk-nav-link">
        <FaBriefcase className="tk-nav-icon" />
        <span>Leads</span>
      </NavLink>
    </div>

    {/* Projects */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Projects Tracking</h3>
      <NavLink to="/dashboard/pipeline" className="tk-nav-link">
        <FaChartLine className="tk-nav-icon" />
        <span>Visual Pipeline</span>
      </NavLink>
      <NavLink to="/dashboard/agreements" className="tk-nav-link">
        <FaFileContract className="tk-nav-icon" />
        <span>Agreements</span>
      </NavLink>
    </div>

    {/* Business Tools */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Business Tools</h3>
      <NavLink to="/dashboard/invoice" className="tk-nav-link">
        <FaFileInvoiceDollar className="tk-nav-icon" />
        <span>Invoices</span>
      </NavLink>
      <NavLink to="/dashboard/email-templates" className="tk-nav-link">
        <FaEnvelope className="tk-nav-icon" />
        <span>Email Templates</span>
      </NavLink>
      <NavLink to="/dashboard/questionnaires" className="tk-nav-link">
        <FaClipboardList className="tk-nav-icon" />
        <span>Questionnaires</span>
      </NavLink>
    </div>

    {/* Account */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Account</h3>
      <NavLink to="/dashboard/profile" className="tk-nav-link">
        <FaUserCircle className="tk-nav-icon" />
        <span>My Profile</span>
      </NavLink>
      <NavLink to={`/dashboard/settings/${currentUser?._id}`} className="tk-nav-link">
        <FaCog className="tk-nav-icon" />
        <span>Settings</span>
      </NavLink>
    </div>
  </>
);

export default FreelencerRout;
