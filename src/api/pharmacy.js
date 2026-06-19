import client from "./client";

/**
 * GET /pharmacy/incoming
 * Returns cards in the "To Pack" column.
 * Expected shape:
 * [{ id: "k1", name: "Nomsa Dlamini", code: "FRE-0041", slot: "Today 10:00" }]
 */
export const getIncomingCards = () =>
  client.get("/pharmacy/incoming").then((res) => res.data);

/**
 * GET /pharmacy/ready
 * Returns cards already packed and waiting for patient pickup.
 */
export const getReadyCards = () =>
  client.get("/pharmacy/ready").then((res) => res.data);

/**
 * PATCH /pharmacy/cards/:id/pack
 * Moves a card from Incoming → Ready.
 */
export const markCardPacked = (cardId) =>
  client.patch(`/pharmacy/cards/${cardId}/pack`).then((res) => res.data);

/**
 * PATCH /pharmacy/cards/:id/collect
 * Marks a card as collected by the patient.
 */
export const markCardCollected = (cardId) =>
  client.patch(`/pharmacy/cards/${cardId}/collect`).then((res) => res.data);
