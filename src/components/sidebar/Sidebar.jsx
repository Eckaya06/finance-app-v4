import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import {
  FiHome,
  FiRepeat,
  FiPieChart,
  FiBox,
  FiClipboard,
  FiChevronsLeft,
  FiChevronsRight,
  FiPlusCircle,
  FiSettings,
  FiBarChart2,
  FiDollarSign,
} from "react-icons/fi";

// Gruplandırılmış menü yapısı
const menuGroups = [
  {
    groupLabel: null, // Üst grup — ayraç yok
    items: [
      { name: "Overview", path: "/home", icon: <FiHome size={20} /> },
      { name: "Analytics", path: "/analytics", icon: <FiBarChart2 size={20} /> },
    ],
  },
  {
    groupLabel: "Spending & Tracking",
    items: [
      { name: "Income & Expense", path: "/income-expense", icon: <FiPlusCircle size={20} /> },
      { name: "Transactions", path: "/transactions", icon: <FiRepeat size={20} /> },
      { name: "Budgets", path: "/budgets", icon: <FiPieChart size={20} /> },
      { name: "Recurring Bills", path: "/bills", icon: <FiClipboard size={20} />, badgeKey: "bills" },
    ],
  },
  {
    groupLabel: "Assets",
    items: [
      { name: "Pots", path: "/pots", icon: <FiBox size={20} /> },
      { name: "Exchange", path: "/exchange", icon: <FiDollarSign size={20} /> },
    ],
  },
  {
    groupLabel: null,
    items: [
      { name: "Settings", path: "/settings", icon: <FiSettings size={20} /> },
    ],
  },
];

// badges prop'u: { bills: 3 } gibi bir obje geçebilirsin
// Örnek kullanım: <Sidebar isCollapsed={...} onToggle={...} badges={{ bills: 3 }} />
const Sidebar = ({ isCollapsed, onToggle, badges = {} }) => {
  const sidebarClassName = `sidebar ${isCollapsed ? "collapsed" : ""}`;

  return (
    <aside className={sidebarClassName}>
      <div className="sidebar-logo">
        <h2 className="logo-text">{isCollapsed ? "f" : "finance"}</h2>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuGroups.map((group, groupIndex) => (
            <li key={groupIndex} className="nav-group">
              {/* Grup başlığı — sadece collapsed değilken ve label varsa göster */}
              {group.groupLabel && !isCollapsed && (
                <span className="nav-group-label">{group.groupLabel}</span>
              )}
              {/* Collapsed iken ayraç çizgisi göster */}
              {group.groupLabel && isCollapsed && (
                <div className="nav-group-divider" />
              )}

              <ul className="nav-list">
                {group.items.map((item) => {
                  const badgeCount = item.badgeKey ? badges[item.badgeKey] : null;
                  return (
                    <li key={item.name} className="nav-item">
                      <NavLink to={item.path} title={item.name}>
                        <span className="nav-icon">{item.icon}</span>
                        {!isCollapsed && (
                          <>
                            <span className="nav-text">{item.name}</span>
                            {badgeCount > 0 && (
                              <span className="nav-badge">{badgeCount}</span>
                            )}
                          </>
                        )}
                        {/* Collapsed iken badge nokta olarak göster */}
                        {isCollapsed && badgeCount > 0 && (
                          <span className="nav-badge-dot" />
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button
          className="minimize-btn"
          onClick={onToggle}
          title={isCollapsed ? "Expand Menu" : "Minimize Menu"}
        >
          {isCollapsed ? <FiChevronsRight size={20} /> : <FiChevronsLeft size={20} />}
          {!isCollapsed && <span>Minimize Menu</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
