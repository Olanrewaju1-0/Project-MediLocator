import "./Sidebar.css";
import { useNavigate } from "react-router-dom";

function Sidebar({ activeTab, onMapClick }) {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">MediLocator</h1>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li
            onClick={onMapClick || (() => navigate("/"))}
            className={!activeTab || activeTab === "hospitals" ? "active" : ""}
          >
            <span className="icon">🏥</span> Hospitals
          </li>
          <li
            onClick={onMapClick || (() => navigate("/map"))}
            className={activeTab === "map" ? "active" : ""}
            style={{ cursor: "pointer" }}
          >
            <span className="icon">🗺️</span> Map
          </li>
          <li>
            <span className="icon">❤️</span> Favorites
          </li>
        </ul>
      </nav>
      <div className="sidebar-support">
        <span className="support-title">Support</span>
        <ul>
          <li>
            <span className="icon">❓</span> Help
          </li>
          <li>
            <span className="icon">⚙️</span> Settings
          </li>
        </ul>
      </div>
      <div className="sidebar-user">
        <img
          className="user-avatar"
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="User avatar"
        />
        <div>
          <div className="user-name">Dr. Jane Lee</div>
          <div className="user-role">Admin</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
