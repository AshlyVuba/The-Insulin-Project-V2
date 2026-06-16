import axiosClient from "./axiosClient";

const USE_MOCK = true;

const MOCK_ORDERS = [
  { id: "k1", name: "Nomsa Dlamini",  ref: "FRE-0041", medication: "Insulin Glargine 100U/ml", pickup_time: "Today 10:00", temp: "2–8°C", status: "incoming" },
  { id: "k2", name: "Thabo Khumalo",  ref: "FRE-0042", medication: "Insulin Actrapid 10ml",     pickup_time: "Today 11:30", temp: "2–8°C", status: "incoming" },
  { id: "k3", name: "Bongani Ndlovu", ref: "FRE-0046", medication: "Insulin Aspart FlexPen",   pickup_time: "Today 14:00", temp: "2–8°C", status: "incoming" },
  { id: "k4", name: "Sipho Mahlangu", ref: "FRE-0044", medication: "Insulin NPH 10ml vial",    pickup_time: "17 Jun 09:00",temp: "2–8°C", status: "incoming" },
  { id: "k5", name: "Lerato Sithole", ref: "FRE-0045", medication: "Insulin Glargine",         pickup_time: "17 Jun 11:00",temp: "2–8°C", status: "incoming" },
  { id: "k6", name: "Zanele Mokoena", ref: "FRE-0043", medication: "Metformin + Insulin",      pickup_time: "Today 09:00", temp: "2–8°C", status: "ready"    },
  { id: "k7", name: "Precious Nkosi", ref: "FRE-0047", medication: "Insulin Glargine",         pickup_time: "18 Jun 10:00",temp: "2–8°C", status: "ready"    },
  { id: "k8", name: "Kagiso Molefe",  ref: "FRE-0048", medication: "Insulin Actrapid",         pickup_time: "Today 15:00", temp: "2–8°C", status: "ready"    },
];

export const pharmacyApi = {
  getOrders: async () => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      return [...MOCK_ORDERS];
    }
    const res = await axiosClient.get("/pharmacy/orders");
    return res.data;
  },

  updateStatus: async (id, status) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return { success: true };
    }
    const res = await axiosClient.patch(`/pharmacy/orders/${id}/status`, { status });
    return res.data;
  },

  createOrder: async (order) => {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return {
        id: `k${Date.now()}`,
        status: "incoming",
        temp: "2-8 C",
        ...order,
      };
    }
    const res = await axiosClient.post("/pharmacy/orders", order);
    return res.data;
  },
};