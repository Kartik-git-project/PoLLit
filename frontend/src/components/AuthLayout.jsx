import React, { useEffect, useState } from "react";
import { Users, TrendingUp, Zap } from "lucide-react";
import { authLayoutStyles as s } from "../assets/dummyStyles";

const AuthLayout = ({ title, subtitle, children }) => {
  const [stats, setStats] = useState({
    users: "0",
    votes: "0",
    polls: "0",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "https://pollit-11av.onrender.com";
        const response = await fetch(`${baseUrl}/api/counts`);
        
        if (response.ok) {
          const result = await response.json();
          // Backend Response Handle Karna ({ success: true, data: { users, polls, votes } })
          if (result.success && result.data) {
            setStats({
              users: result.data.users.toLocaleString(),
              votes: result.data.votes.toLocaleString(),
              polls: result.data.polls.toLocaleString(),
            });
          }
        }
      } catch (error) {
        console.error("Failed to load platform stats:", error);
      }
    };

    fetchStats();
  }, []);

  const STATS = [
    { Icon: Users, value: stats.users, label: "Community members" },
    { Icon: TrendingUp, value: stats.votes, label: "Votes cast" },
    { Icon: Zap, value: stats.polls, label: "Polls created" },
  ];

  return (
    <div className={s.container}>
      {/* Left Panel */}
      <div className={s.leftPanel}>
        <div className={s.gridPattern} style={s.gridPatternStyle} />
        <div className={s.glowTop} />
        <div className={s.glowBottom} />

        {/* logo */}
        <div className={s.logoContainer}>
          <img src="/favicon.svg" alt="logo" className={s.logoImg} />
          <span className={s.logoText}>PoLLit</span>
        </div>

        {/* main */}
        <div className={s.mainCopyContainer}>
          <div className={s.mainCopyInner}>
            <span className={s.liveBadge}>
              <span className={s.dot}></span>
              Live community
            </span>
            <h2 className={s.heading}>
              Every opinion
              <br />
              <span className={s.emeraldText}>deserves to</span>
              <br />
              be counted.
            </h2>
          </div>

          <p className={s.description}>
            Create poll in seconds, collect votes instantly, and discover what
            your community truly thinks.
          </p>

          <div className={s.statsGrid}>
            {STATS.map(({ Icon, value, label }) => (
              <div key={label} className={s.statCard}>
                <Icon size={15} className={s.emeraldText} />
                <div className={s.statValue}>{value}</div>
                <div className={s.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className={s.footer}>
          &copy; {new Date().getFullYear()} PoLLit • Made for the community
        </p>
      </div>

      {/* Right Panel */}
      <div className={s.rightPanel}>
        <div className={s.formContainer}>
          <div className={s.mobileLogoContainer}>
            <img
              src="/favicon.svg"
              alt="logo"
              className={s.mobileLogoImg}
            />
            <span className={s.mobileLogoText}>PoLLit</span>
          </div>

          <div className={s.headingWrapper}>
            <h1 className={s.pageTitle}>{title}</h1>
            {subtitle && <p className={s.subtitle}>{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;