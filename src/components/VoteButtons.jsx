import { useState } from "react";
import { confirmationsApi } from "../api/resources";
import { extractErrorMessage } from "../api/errors";
import { VOTE } from "../constants";
import StatusMessage from "./StatusMessage";

export default function VoteButtons({ submission, myVote, onVoted }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function castVote(vote) {
    setPending(true);
    setError("");
    try {
      await confirmationsApi.cast({ submission: submission.id, vote });
      onVoted();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not record your vote."));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="vote-buttons">
      <button
        type="button"
        className={`btn btn-vote ${myVote === VOTE.ACCESSIBLE ? "btn-vote-active" : ""}`}
        disabled={pending}
        aria-pressed={myVote === VOTE.ACCESSIBLE}
        onClick={() => castVote(VOTE.ACCESSIBLE)}
      >
        Accessible ({submission.accessible_count})
      </button>
      <button
        type="button"
        className={`btn btn-vote ${myVote === VOTE.NOT_ACCESSIBLE ? "btn-vote-active" : ""}`}
        disabled={pending}
        aria-pressed={myVote === VOTE.NOT_ACCESSIBLE}
        onClick={() => castVote(VOTE.NOT_ACCESSIBLE)}
      >
        Not accessible ({submission.inaccessible_count})
      </button>
      <StatusMessage tone="error">{error}</StatusMessage>
    </div>
  );
}
