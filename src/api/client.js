import axios from "axios";

const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach auth token from sessionStorage on every request
client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("fre_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
