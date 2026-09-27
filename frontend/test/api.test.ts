import { describe, expect, it, vi } from "vitest";
import { canDelete, subscribePlants } from "../src/api";
import type { HomeAssistant, PlantsPayload } from "../src/types";

function fakeHass() {
  let push: (payload: PlantsPayload) => void = () => undefined;
  const unsubscribe = vi.fn(async () => undefined);
  const subscribeMessage = vi.fn(async (callback: (p: PlantsPayload) => void) => {
    push = callback;
    return unsubscribe;
  });
  const hass = {
    connection: { subscribeMessage },
    user: { id: "u1", is_admin: false },
  } as unknown as HomeAssistant;
  return { hass, subscribeMessage, unsubscribe, push: (p: PlantsPayload) => push(p) };
}

const payload: PlantsPayload = { loaded: true, vacation: false, plants: [] };

describe("subscribePlants", () => {
  it("shares one subscription between cards", async () => {
    const fake = fakeHass();
    const a = vi.fn();
    const b = vi.fn();
    const stopA = subscribePlants(fake.hass, a);
    const stopB = subscribePlants(fake.hass, b);
    await Promise.resolve();
    expect(fake.subscribeMessage).toHaveBeenCalledTimes(1);

    fake.push(payload);
    expect(a).toHaveBeenCalledWith(payload);
    expect(b).toHaveBeenCalledWith(payload);

    // A card added later gets the last payload right away.
    const c = vi.fn();
    const stopC = subscribePlants(fake.hass, c);
    expect(c).toHaveBeenCalledWith(payload);

    stopA();
    stopB();
    expect(fake.unsubscribe).not.toHaveBeenCalled();
    stopC();
    await vi.waitFor(() => expect(fake.unsubscribe).toHaveBeenCalledTimes(1));
  });
});

describe("canDelete", () => {
  const entry = { id: "e", plant_id: "p", ts: "", type: "watered", source: "card" };

  it("allows own entries", () => {
    const { hass } = fakeHass();
    expect(canDelete(hass, { ...entry, user_id: "u1" })).toBe(true);
    expect(canDelete(hass, { ...entry, user_id: "u2" })).toBe(false);
    expect(canDelete(hass, entry)).toBe(false);
  });

  it("allows admins everything", () => {
    const { hass } = fakeHass();
    hass.user = { id: "admin", is_admin: true };
    expect(canDelete(hass, entry)).toBe(true);
  });
});
