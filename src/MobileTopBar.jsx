import { useState } from "react";
import { MdMenu } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Hospitals", path: "/" },
  { label: "Map", path: "/map" },
  { label: "Favorites", path: "/favorites" },
  { label: "Help", path: "/help" },
  { label: "Settings", path: "/settings" },
];

function MobileTopBar({ activeTab }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: 56,
        background: "#f7f7fb",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 1px 0 #ececec",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <button
        style={{
          background: "none",
          border: "none",
          fontSize: 28,
          marginLeft: 12,
          cursor: "pointer",
        }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
      >
        <MdMenu />
      </button>
      <span style={{ fontWeight: 700, fontSize: 18, marginLeft: 16 }}>
        MediLocator
      </span>
      {open && (
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 0,
            width: "100vw",
            background: "#fff",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            zIndex: 200,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => handleMenuClick(item.path)}
              style={{
                padding: "16px 24px",
                fontWeight: activeTab === item.label.toLowerCase() ? 700 : 500,
                color:
                  activeTab === item.label.toLowerCase() ? "#5a4ff3" : "#222",
                background:
                  activeTab === item.label.toLowerCase()
                    ? "#ececff"
                    : "transparent",
                cursor: "pointer",
                borderBottom: "1px solid #ececec",
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MobileTopBar;
