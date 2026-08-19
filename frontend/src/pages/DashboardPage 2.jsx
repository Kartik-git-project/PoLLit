import React, { useState } from "react";
import { dashboardStyles as s } from "../assets/dummyStyles";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import usePolls from "../hooks/usePolls";
import { Avatar, PollSkeleton } from "../components/UIElements";
import FilterBar from "../components/FilterBar";
import PollCard from "../components/PollCard"; // Added PollCard import
import { Compass, Users2, PenSquare, Sparkles } from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feed, setFeed] = useState("all");
  const [type, setType] = useState("all");
  const [params] = useSearchParams();
  const q = (params.get("q") || "").toLowerCase();

  const qs = new URLSearchParams();
  if (type !== "all") qs.set("type", type);
  if (feed === "following") qs.set("feed", "following");
  const path = `/polls${qs.toString() ? `?${qs}` : ""}`;

  // to get polls
  const { polls, loading, vote, unvote, bookmark } = usePolls(path);

  const shown = polls
    .filter((p) => p.question.toLowerCase().includes(q))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className={s.container}>
      <div className={s.greetingRow}>
        <div>
          <h1 className={s.greetingHeading}>
            Hey, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className={s.greetingSub}>What's the community thinking today?</p>
        </div>
      </div>

      <div className={s.composer}>
        <Avatar user={user || {}} className={s.composerAvatar} />
        <button
          onClick={() => navigate("/create-poll")}
          className={s.composerInput}
        >
          Ask the community something...
        </button>
        <button
          onClick={() => navigate("/create-poll")}
          className={s.composerButton}
        >
          <PenSquare size={16} />
        </button>
      </div>

      {/* feed tabs */}
      <div className={s.feedTabs}>
        {[
          ["all", "Explore", Compass],
          ["following", "Following", Users2],
        ].map(([k, label, Icon]) => (
          <button
            key={k}
            onClick={() => setFeed(k)}
            className={`${s.tabBase} ${
              feed === k ? s.tabActive : s.tabInactive
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <FilterBar value={type} onChange={setType} />

      {loading ? (
        <PollSkeleton />
      ) : shown.length === 0 ? (
        <div className={s.emptyContainer}>
          <span className={s.emptyIcon}>
            <Sparkles size={22} />
          </span>

          <p className={s.emptyTitle}>
            {q
              ? `No result for "${q}"`
              : feed === "following"
              ? "Nobody you follow has posted yet"
              : "Nothing here yet"}
          </p>

          <p className={s.emptyDesc}>
            {feed === "following"
              ? "Follow creators to see their polls."
              : "Be the first to create a poll!"}
          </p>

          <button
            onClick={() => navigate("/create-poll")}
            className={s.emptyButton}
          >
            <PenSquare size={14} /> Create a poll
          </button>
        </div>
      ) : (
        shown.map((p) => (
          <PollCard
            key={p._id}
            poll={p}
            vote={vote}
            unvote={unvote}
            bookmark={bookmark}
          />
        ))
      )}
    </div>
  );
};

export default DashboardPage;