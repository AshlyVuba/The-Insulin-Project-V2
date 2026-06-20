import client from "./client";

/**
 * GET /api/v1/pharmacy/incoming
 * Returns appointments with status='pulled' — files the filing clerk has sent.
 * Shape: [{ id, name, code, slot }]
 */
export const getIncomingCards = () =>
  client.get("/api/v1/pharmacy/incoming").then((res) => res.data);

/**
 * GET /api/v1/pharmacy/ready
 * Returns appointments with status='dispensed' — packed, waiting for pickup.
 * Shape: [{ id, name, code, slot }]
 */
export const getReadyCards = () =>
  client.get("/api/v1/pharmacy/ready").then((res) => res.data);

/**
 * PATCH /api/v1/pharmacy/cards/:id/pack
 * Moves a card from Incoming → Ready. (pulled → dispensed)
 */
export const markCardPacked = (cardId) =>
  client.patch(`/api/v1/pharmacy/cards/${cardId}/pack`).then((res) => res.data);

/**
 * PATCH /api/v1/pharmacy/cards/:id/collect
 * Confirms the patient collected their medication.
 */
export const markCardCollected = (cardId) =>
  client.patch(`/api/v1/pharmacy/cards/${cardId}/collect`).then((res) => res.data);