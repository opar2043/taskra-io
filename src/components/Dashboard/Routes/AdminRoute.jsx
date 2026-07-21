import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBriefcase,
  FaFileInvoiceDollar,
  FaCamera,
  FaUsers,
  FaCog,
  FaChartLine,
  FaMoneyBillWave,
  FaFileAlt,
  FaBook,
  FaStar,
  FaListOl,
  FaCalendarAlt,
} from "react-icons/fa";

const AdminRoute = ({ currentUser }) => (
  <>
    {/* Overview */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Overview</h3>
      <NavLink to="/dashboard" end className="tk-nav-link">
        <FaTachometerAlt className="tk-nav-icon" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/dashboard/analytics" className="tk-nav-link">
        <FaChartLine className="tk-nav-icon" />
        <span>Analytics</span>
      </NavLink>
      <NavLink to="/dashboard/calender" className="tk-nav-link">
        <FaCalendarAlt className="tk-nav-icon" />
        <span>Calendar</span>
      </NavLink>
    </div>

    {/* Job Management */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Job Management</h3>
      <NavLink to="/dashboard/all-jobs" className="tk-nav-link">
        <FaBriefcase className="tk-nav-icon" />
        <span>All Jobs</span>
      </NavLink>
    </div>

    {/* User Management */}
    <div className="mb-3">
      <h3 className="tk-nav-section">User Management</h3>
      <NavLink to="/dashboard/clients" className="tk-nav-link">
        <FaUsers className="tk-nav-icon" />
        <span>Clients</span>
      </NavLink>
      <NavLink to="/dashboard/freelancers" className="tk-nav-link">
        <FaCamera className="tk-nav-icon" />
        <span>Professionals</span>
      </NavLink>
    </div>

    {/* Financial */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Financial</h3>
      <NavLink to="/dashboard/orders" className="tk-nav-link">
        <FaFileInvoiceDollar className="tk-nav-icon" />
        <span>Invoices</span>
      </NavLink>
      <NavLink to="/dashboard/transactions" className="tk-nav-link">
        <FaMoneyBillWave className="tk-nav-icon" />
        <span>Active Transactions</span>
      </NavLink>
    </div>

    {/* Resources */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Resources</h3>
      <NavLink to="/dashboard/docs" className="tk-nav-link">
        <FaBook className="tk-nav-icon" />
        <span>System Docs</span>
      </NavLink>
    </div>

    {/* Home Sections */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Home Sections</h3>
      <NavLink to="/dashboard/featured-creatives" className="tk-nav-link">
        <FaStar className="tk-nav-icon" />
        <span>Featured Creatives</span>
      </NavLink>
      <NavLink to="/dashboard/how-it-works" className="tk-nav-link">
        <FaListOl className="tk-nav-icon" />
        <span>How It Works</span>
      </NavLink>
    </div>

    {/* Settings */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Settings</h3>
      <NavLink to="/dashboard/faqs" className="tk-nav-link">
        <FaFileAlt className="tk-nav-icon" />
        <span>Manage FAQs</span>
      </NavLink>
      <NavLink to="/dashboard/pricing-admin" className="tk-nav-link">
        <FaMoneyBillWave className="tk-nav-icon" />
        <span>Manage Pricing</span>
      </NavLink>
      <NavLink to={`/dashboard/settings/${currentUser?._id}`} className="tk-nav-link">
        <FaCog className="tk-nav-icon" />
        <span>Settings</span>
      </NavLink>
    </div>
  </>
);

export default AdminRoute;
