import client from "./client";

export function register(username, password) {
  return client.post("/auth/register/", { username, password }).then((r) => r.data);
}

export function login(username, password) {
  return client.post("/auth/token/", { username, password }).then((r) => r.data);
}
