import client from "./client";

function list(path, params) {
  return client.get(path, { params }).then((r) => r.data.results ?? r.data);
}

export const campusesApi = {
  list: () => list("/campuses/"),
};

export const featuresApi = {
  list: () => list("/features/"),
};

export const venuesApi = {
  list: ({ campus, category } = {}) => list("/venues/", { campus, category }),
  get: (id) => client.get(`/venues/${id}/`).then((r) => r.data),
};

export const submissionsApi = {
  listByVenue: (venueId) => list("/submissions/", { venue: venueId }),
};

export const confirmationsApi = {
  listBySubmission: (submissionId) => list("/confirmations/", { submission: submissionId }),
  cast: ({ submission, vote }) =>
    client.post("/confirmations/", { submission, vote }).then((r) => r.data),
};

export const commentsApi = {
  listBySubmission: (submissionId) => list("/comments/", { submission: submissionId }),
  create: ({ submission, body, parent = null }) =>
    client.post("/comments/", { submission, body, parent }).then((r) => r.data),
  remove: (id) => client.delete(`/comments/${id}/`),
};

export const commentReactionsApi = {
  listByComment: (commentId) => list("/comment-reactions/", { comment: commentId }),
  // Upsert "my reaction" to a comment -- creates it on a first vote, flips
  // it in place on a switch (LIKE <-> DISLIKE). To undo, delete the
  // reaction by its own id instead (see `remove` below).
  react: (commentId, vote) =>
    client.patch(`/comments/${commentId}/reaction/`, { vote }).then((r) => r.data),
  remove: (reactionId) => client.delete(`/comment-reactions/${reactionId}/`),
};
