import React, { useState, useRef } from "react";
import { layoutStyles as s } from "../assets/dummyStyles";
import { NavLink, useNavigate, useSearchParams, Outlet } from "react-router-dom";
import { 
  Bookmark, 
  CheckCircle2, 
  LayoutGrid, 
  PenLine, 
  PlusSquare, 
  Search, 
  X, 
  Plus,
  Settings,
  LogOut 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useClickOutside from "../hooks/useClickOutside"; 
import NotificationBell from "./NotificationBell";
import { Avatar } from "./UIElements";
import Sidebar from "./Sidebar"; // 💡 Right sidebar import

const NAV = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutGrid },
  { to: "/create-poll", label: "Create", Icon: PlusSquare },
  { to: "/my-polls", label: "My Polls", Icon: PenLine },
  { to: "/voted-polls", label: "Voted", Icon: CheckCircle2 },
  { to: "/bookmarked-polls", label: "Saved", Icon: Bookmark },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userOpen, setUserOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const q = searchParams.get("q") || "";

  const userRef = useRef(null);

  useClickOutside(userRef, () => setUserOpen(false), userOpen);

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <NavLink to="/dashboard" className={s.logoLink}>
            <img src="/favicon.svg" alt="logo" className={s.logoImg} />
            <span className={s.logoSpan}>PoLLit</span>
          </NavLink>

          {/* Desktop Search */}
          <div className={s.searchDesktop}>
            <Search size={14} className={s.searchIcon} />
            <input
              value={q}
              onChange={(e) =>
                navigate(`/dashboard?q=${encodeURIComponent(e.target.value)}`, {
                  replace: true,
                })
              }
              placeholder="Search polls"
              className={s.searchInput}
            />
          </div>

          {/* Right Cluster */}
          <div className={s.rightCluster}>
            <button
              onClick={() => setMobileSearch((v) => !v)}
              className={s.mobileSearchToggle}
            >
              {mobileSearch ? <X size={17} /> : <Search size={17} />}
            </button>

            <NavLink to="/create-poll" className={s.createButton}>
              <Plus size={15} /> Create
            </NavLink>

            {/* Notifications */}
            <NotificationBell />

            {/* Avatar */}
            <div ref={userRef} className={s.avatarWrapper}>
              <Avatar user={user || {}} className={s.avatarClass} />
            </div>
          </div>
        </div>

        {/* Mobile Expanded Search */}
        {mobileSearch && (
          <div className={s.mobileSearchContainer}>
            <div className={s.mobileSearchInner}>
              <Search size={14} className={s.searchIcon} />
              <input
                autoFocus
                value={q}
                onChange={(e) =>
                  navigate(`/dashboard?q=${encodeURIComponent(e.target.value)}`, {
                    replace: true,
                  })
                }
                placeholder="Search polls"
                className={s.mobileSearchInput}
              />
            </div>
          </div>
        )}
      </header>

      {/* Body Container */}
      <div className={s.bodyContainer}>
        {/* Left Sidebar */}
        <aside className={s.leftSidebar}>
          <p className={s.menuLabel}>Menu</p>

          <nav className={s.navContainer}>
            {NAV.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${s.sideLinkBase} ${isActive ? s.sideLinkActive : s.sideLinkInactive}`
                }
              >
                <Icon size={16} className="shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Bottom */}
          <div className={s.sidebarBottom}>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `${s.sideLinkBase} ${isActive ? s.sideLinkActive : s.sideLinkInactive}`
              }
            >
              <Settings size={16} className="shrink-0" /> Settings
            </NavLink>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className={s.logoutButton}
            >
              <LogOut size={16} className="shrink-0" /> Log out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={s.mainContent}>
          <Outlet />
        </main>

        {/* Right Rail / Sidebar */}
        <aside className={s.rightRail}>
          <Sidebar />
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className={s.bottomNav}>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${s.bottomLinkBase} ${isActive ? s.bottomLinkActive : s.bottomLinkInactive}`
            }
          >
            <Icon size={20} />
            <span>{label.split(" ")[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;