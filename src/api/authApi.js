import axiosClient from "./axiosClient";

// Toggle this flag to use mock data while backend is not ready
const USE_MOCK = true;

const MOCK_USERS = {
  "filing@clinic.gov.za":   { name: "Nandi Sithole",  role: "filing",   clinic: "Tshwane Municipality Clinic" },
  "pharmacy@clinic.gov.za": { name: "Dr. K. Molefe",  role: "pharmacy", clinic: "Tshwane Municipality Clinic" },
  "admin@clinic.gov.za":    { name: "Admin User",      role: "admin",    clinic: "Tshwane Municipality Clinic" },
};

export const authApi = {
  login: async (email, password) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 700)); // simulate network
      const user = MOCK_USERS[email];
      if (!user || password !== "password123") {
        const err = { response: { data: { detail: "Invalid email or password." } } };
        throw err;
      }
      return { access_token: "mock-jwt-token-" + Date.now(), user };
    }
    const res = await axiosClient.post("/auth/login", { email, password });
    return res.data;
  },
};
