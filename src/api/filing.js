import client from "./client";

/**
 * GET /filing/slots
 * Returns an array of arrival slot objects, each with a files[] array.
 * Expected shape:
 * [
 *   {
 *     id: "slot-0800",
 *     label: "08:00 – 09:00",
 *     badge: "urgent" | "today" | "upcoming",
 *     files: [
 *       { id: 1, patient: "Nomsa Dlamini", folder: "FRE-0041", sent: false }
 *     ]
 *   }
 * ]
 */
export const getFilingSlots = () =>
  client.get("/filing/slots").then((res) => res.data);

/**
 * PATCH /filing/files/:id/send
 * Marks a file as sent to pharmacy.
 */
export const sendFileToPharmacy = (fileId) =>
  client.patch(`/filing/files/${fileId}/send`).then((res) => res.data);
