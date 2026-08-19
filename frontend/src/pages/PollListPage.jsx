import React from 'react';
import { pollListPageStyles as s } from '../assets/dummyStyles';
import usePolls from '../hooks/usePolls';
import PollCard from '../components/PollCard';

const PollListPage = ({
  title,
  path,
  owner = false,
  Icon,
  emptyTitle,
  emptyText,
  action
}) => {
  const { polls, loading, vote, unvote, bookmark, edit, close, remove } = usePolls(path);

  return (
    <div>
      <h1 className={s.heading}>{title}</h1>

      {loading ? (
        <div className="text-white p-4">Loading polls...</div>
      ) : polls.length === 0 ? (
        <div className={s.emptyContainer}>
          {Icon && (
            <span className={s.emptyIconWrapper}>
              <Icon size={24} />
            </span>
          )}
          <p className={s.emptyTitle}>{emptyTitle}</p>
          <p className={s.emptyText}>{emptyText}</p>
          {action}
        </div>
      ) : (
        polls.map((p) => (
          <PollCard
            key={p._id}
            poll={p}
            vote={vote}
            unvote={unvote}
            bookmark={bookmark}
            edit={edit}
            close={close}
            remove={remove}
            owner={owner}
          />
        ))
      )}
    </div>
  );
};

export default PollListPage;