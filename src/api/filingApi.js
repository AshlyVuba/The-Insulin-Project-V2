import axiosClient from "./axiosClient";

const USE_MOCK = true;

const MOCK_FILES = [
  { id: 1, name: "Nomsa Dlamini",  ref: "FRE-0041", pickup_date: "2025-06-16", medication: "Insulin Glargine 100U/ml",  status: "urgent",   pulled: false },
  { id: 2, name: "Thabo Khumalo",  ref: "FRE-0042", pickup_date: "2025-06-16", medication: "Insulin Actrapid 10ml",      status: "today",    pulled: false },
  { id: 3, name: "Zanele Mokoena", ref: "FRE-0043", pickup_date: "2025-06-16", medication: "Metformin 850mg + Insulin",  status: "today",    pulled: true  },
  { id: 4, name: "Sipho Mahlangu", ref: "FRE-0044", pickup_date: "2025-06-17", medication: "Insulin NPH 10ml vial",      status: "upcoming", pulled: false },
  { id: 5, name: "Lerato Sithole", ref: "FRE-0045", pickup_date: "2025-06-17", medication: "Insulin Glargine 100U/ml",  status: "upcoming", pulled: false },
  { id: 6, name: "Bongani Ndlovu", ref: "FRE-0046", pickup_date: "2025-06-16", medication: "Insulin Aspart FlexPen",    status: "urgent",   pulled: false },
  { id: 7, name: "Precious Nkosi", ref: "FRE-0047", pickup_date: "2025-06-18", medication: "Insulin Glargine 100U/ml",  status: "upcoming", pulled: true  },
  { id: 8, name: "Kagiso Molefe",  ref: "FRE-0048", pickup_date: "2025-06-16", medication: "Insulin Actrapid 10ml",     status: "today",    pulled: true  },
];

export const filingApi = {
  getFiles: async () => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return [...MOCK_FILES];
    }
    const res = await axiosClient.get("/filing/files");
    return res.data;
  },

  markPulled: async (id) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return { success: true };
    }
    const res = await axiosClient.patch(`/filing/files/${id}/pull`);
    return res.data;
  },

  sendReminder: async (id) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return { success: true, message: "SMS sent" };
    }
    const res = await axiosClient.post(`/filing/files/${id}/remind`);
    return res.data;
  },

  createFastTrackEntry: async (entry) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return {
        id: Date.now(),
        status: "today",
        pulled: false,
        ...entry,
      };
    }
    const res = await axiosClient.post("/filing/files", entry);
    return res.data;
  },
};
