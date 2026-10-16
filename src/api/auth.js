import client from "./client";

export function register(username, password) {
  return client.post("/auth/register/", { username, password }).then((r) => r.data);
}

export function login(username, password) {
  return client.post("/auth/token/", { username, password }).then((r) => r.data);
}

export function me() {
  return client.get("/auth/me/").then((r) => r.data);
}
