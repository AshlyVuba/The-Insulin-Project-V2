import client from "./client";

/**
 * GET /api/v1/filing/upcoming
 * Backend returns: { count: N, appointments: [{ id, patient_name, folder_number, collection_date, time_slot }] }
 *
 * We transform this into the grouped slot shape the FilingRoomPage expects:
 * [{ id, label, badge, files: [{ id, patient, folder, sent }] }]
 */
export const getFilingSlots = () =>
  client.get("/api/v1/filing/upcoming").then((res) => {
    const appointments = res.data.appointments ?? [];

    // Group appointments by time_slot
    const slotMap = {};
    appointments.forEach((appt) => {
      const key = appt.time_slot;
      if (!slotMap[key]) {
        slotMap[key] = {
          id:    `slot-${key.replace(/[^a-zA-Z0-9]/g, "")}`,
          label: key,
          badge: "upcoming",
          files: [],
        };
      }
      slotMap[key].files.push({
        id:      appt.id,
        patient: appt.patient_name,
        folder:  appt.folder_number,
        sent:    false,
      });
    });

    return Object.values(slotMap);
  });

/**
 * PATCH /api/v1/filing/files/:id/send
 * Marks a file as sent to pharmacy.
 */
export const sendFileToPharmacy = (fileId) =>
  client.patch(`/api/v1/filing/files/${fileId}/send`).then((res) => res.data);
