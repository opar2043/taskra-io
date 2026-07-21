import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaBriefcase,
  FaPlusSquare,
  FaProjectDiagram,
  FaFileContract,
  FaSearch,
  FaStar,
  FaUserCircle,
  FaCog,
} from "react-icons/fa";

/**
 * Full list of client dashboard routes.
 * Corresponding route paths are defined in src/main.jsx.
 */
const ClientRoute = ({ currentUser }) => (
  <>
    {/* Overview */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Overview</h3>
      <NavLink to="/dashboard" end className="tk-nav-link">
        <FaTachometerAlt className="tk-nav-icon" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/dashboard/calender" className="tk-nav-link">
        <FaCalendarAlt className="tk-nav-icon" />
        <span>Calendar</span>
      </NavLink>
    </div>

    {/* Jobs */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Jobs</h3>
      <NavLink to="/dashboard/post-job" className="tk-nav-link">
        <FaPlusSquare className="tk-nav-icon" />
        <span>Post a Job</span>
      </NavLink>
      <NavLink to="/dashboard/my-jobs" className="tk-nav-link">
        <FaBriefcase className="tk-nav-icon" />
        <span>My Jobs</span>
      </NavLink>
    </div>

    {/* Projects & Agreements */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Projects Tracking</h3>
      <NavLink to="/dashboard/active-projects" className="tk-nav-link">
        <FaProjectDiagram className="tk-nav-icon" />
        <span>Active Projects</span>
      </NavLink>
      <NavLink to="/dashboard/agreements" className="tk-nav-link">
        <FaFileContract className="tk-nav-icon" />
        <span>Agreements</span>
      </NavLink>
    </div>

    {/* Professionals */}
    <div className="mb-3">
      <h3 className="tk-nav-section">Professionals</h3>
      <NavLink to="/dashboard/find-freelancers" className="tk-nav-link">
        <FaSearch className="tk-nav-icon" />
        <span>Find Professionals</span>
      </NavLink>
      <NavLink to="/dashboard/saved-freelancers" className="tk-nav-link">
        <FaStar className="tk-nav-icon" />
        <span>Saved Professionals</span>
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

export default ClientRoute;
