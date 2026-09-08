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
  create: ({ submission, body }) =>
    client.post("/comments/", { submission, body }).then((r) => r.data),
  remove: (id) => client.delete(`/comments/${id}/`),
};
