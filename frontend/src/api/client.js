const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TOKEN_KEY = "elysium_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || (json && json.status === 0)) {
    const message = (json && json.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json;
}

export function mediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function uploadFile(file) {
  const body = new FormData();
  body.append("file", file);
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE_URL}/api/admin/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || (json && json.status === 0)) {
    throw new Error((json && json.message) || `Upload failed (${res.status})`);
  }
  return json.data; // { url, filename }
}

export const api = {
  // ---- public ----
  getSite: () => request("/api/site"),
  getCourses: (category) =>
    request(`/api/courses${category ? `?category=${category}` : ""}`),
  getCourse: (slug) => request(`/api/courses/${slug}`),
  getBranches: () => request("/api/branches"),
  getBlog: () => request("/api/blog"),
  getBlogPost: (slug) => request(`/api/blog/${slug}`),
  getGallery: () => request("/api/gallery"),
  getAwards: () => request("/api/awards"),
  createEnquiry: (data) =>
    request("/api/enquiries", { method: "POST", body: data }),
  getReviews: () => request("/api/reviews"),
  createReview: (data) =>
    request("/api/reviews", { method: "POST", body: data }),

  uploadImage: (file) => uploadFile(file),

  // ---- auth ----
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password } }),
  me: () => request("/api/auth/me", { auth: true }),

  // ---- admin (generic CRUD) ----
  adminList: (resource) => request(`/api/admin/${resource}`, { auth: true }),
  adminCreate: (resource, data) =>
    request(`/api/admin/${resource}`, { method: "POST", body: data, auth: true }),
  adminUpdate: (resource, id, data) =>
    request(`/api/admin/${resource}/${id}`, { method: "PUT", body: data, auth: true }),
  adminDelete: (resource, id) =>
    request(`/api/admin/${resource}/${id}`, { method: "DELETE", auth: true }),

  // ---- enquiry notes ----
  getEnquiryNotes: (id) => request(`/api/admin/enquiries/${id}/notes`, { auth: true }),
  addEnquiryNote: (id, body) =>
    request(`/api/admin/enquiries/${id}/notes`, { method: "POST", body: { body }, auth: true }),

  // ---- settings ----
  adminGetSettings: () => request("/api/admin/settings", { auth: true }),
  adminSaveSettings: (data) =>
    request("/api/admin/settings", { method: "PUT", body: data, auth: true }),
};
