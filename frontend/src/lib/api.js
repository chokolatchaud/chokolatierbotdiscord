import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export function formatApiError(err) {
  const d = err?.response?.data?.detail;
  if (d == null) return err?.message || "Une erreur est survenue";
  if (typeof d === "string") return d;
  if (Array.isArray(d))
    return d.map((e) => (e?.msg ? e.msg : JSON.stringify(e))).join(" ");
  if (typeof d?.msg === "string") return d.msg;
  return String(d);
}
