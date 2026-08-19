import { useCallback, useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

export default function usePolls(path) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refresh } = useAuth();

  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(path);
      setPolls(data);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  const replace = (p) => {
    setPolls((arr) => arr.map((x) => (x._id === p._id ? p : x)));
  };

  // Vote on a poll with Optimistic Instant Update
  const vote = async (id, value) => {
    const targetPoll = polls.find((p) => p._id === id);
    const wasVoted = targetPoll?.myVote != null;

    // Instant local state update
    setPolls((prev) =>
      prev.map((p) => {
        if (p._id !== id) return p;
        return {
          ...p,
          myVote: value,
          totalVotes: wasVoted ? p.totalVotes : (p.totalVotes || 0) + 1,
        };
      })
    );

    try {
      await api.post(`/polls/${id}/vote`, { value });
      const { data } = await api.get(`/polls/${id}?noview=true`);
      replace(data);
      toast(wasVoted ? "Vote changed" : "Vote recorded");
      refresh();
    } catch (err) {
      // Revert back if backend fails
      load();
      toast(err.response?.data?.message || "Failed to record vote");
    }
  };

  // Remove vote with Optimistic Instant Update
  const unvote = async (id) => {
    // Instant local state update
    setPolls((prev) =>
      prev.map((p) => {
        if (p._id !== id) return p;
        return {
          ...p,
          myVote: null,
          totalVotes: Math.max(0, (p.totalVotes || 0) - 1),
        };
      })
    );

    try {
      await api.delete(`/polls/${id}/vote`);
      const { data } = await api.get(`/polls/${id}?noview=true`);
      replace(data);
      toast("Vote removed");
      refresh();
    } catch (err) {
      load();
      toast(
        err.response?.data?.message ||
          "Couldn't remove vote - is the server running"
      );
    }
  };

  const bookmark = async (id) => {
    const { data } = await api.post(`/polls/${id}/bookmark`);

    setPolls((arr) =>
      arr.map((x) =>
        x._id === id
          ? {
              ...x,
              isBookmarked: !x.isBookmarked,
              saves: (x.saves || 0) + (x.isBookmarked ? -1 : 1),
            }
          : x
      )
    );
    toast(data.bookmarked ? "Saved" : "Removed from saved");
    refresh();
  };

  const edit = async (id, payload) => {
    await api.patch(`/polls/${id}`, payload);
    const { data } = await api.get(`/polls/${id}?noview=true`);
    replace(data);
    toast("Poll updated");
  };

  const close = async (id) => {
    const { data } = await api.patch(`/polls/${id}/close`);
    setPolls((arr) =>
      arr.map((x) =>
        x._id === id
          ? {
              ...x,
              closed: data.closed,
            }
          : x
      )
    );
    toast(data.closed ? "Poll closed" : "Poll re-opened");
  };

  const remove = async (id) => {
    await api.delete(`/polls/${id}`);
    setPolls((arr) => arr.filter((p) => p._id !== id));
  };

  return {
    polls,
    loading,
    load,
    replace,
    vote,
    unvote,
    bookmark,
    edit,
    close,
    remove,
  };
}