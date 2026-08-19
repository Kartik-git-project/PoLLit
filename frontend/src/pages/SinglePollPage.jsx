import React, { useEffect, useState } from 'react'
import { singlePollPageStyles as s } from '../assets/dummyStyles'
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ArrowLeft } from 'lucide-react';
import { PollSkeleton } from '../components/UIElements';
import PollCard from '../components/PollCard';

const SinglePollPage = () => {


  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  const load = async (skipView = false) => {
    try {
      const { data } = await api .get(
        `/polls/${id}${skipView ? "?noview=true" : ""}`,
      );
      setPoll(data);
    } catch {
      setMissing(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load(false);
  }, [id]);

  const vote = async (_id, value) => {
    await api.post(`/polls/${id}/vote`, { value });
    await load(true);
    refresh();
  };
  const unvote = async () => {
    await api.delete(`/polls/${id}/vote`);
    await load(true);
    refresh();
  };
  const bookmark = async () => {
    await api.post(`/polls/${id}/bookmark`);
    setPoll((p) => ({
      ...p,
      isBookmarked: !p.isBookmarked,
      saves: (p.saves || 0) + (p.isBookmarked ? -1 : 1),
    }));
    refresh();
  };
  const edit = async (_id, payload) => {
    await api.patch(`/polls/${id}`, payload);
    await load(true);
  };
  const close = async () => {
    const { data } = await api.patch(`/polls/${id}/close`);
    setPoll((p) => ({ ...p, closed: data.closed }));
  };
  const remove = async () => {
    await api.delete(`/polls/${id}`);
    navigate("/dashboard");
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className={s.backButton}>
        <ArrowLeft size={14} /> Back
      </button>

      {loading ? (
        <PollSkeleton count={1} />
      ) : missing || !poll ? (
        <div className={s.errorContainer}>
          This poll doesn't exist or was deleted
        </div>
      ) : (
        <PollCard
          poll={poll}
          vote={vote}
          unvote={unvote}
          bookmark={bookmark}
          edit={edit}
          close={close}
          remove={remove}
          owner={poll.creator?._id === user?._id}
        />
      )}
    </div>
  );
}

export default SinglePollPage
