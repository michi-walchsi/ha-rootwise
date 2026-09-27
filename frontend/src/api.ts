import type { HassConnection, HomeAssistant, JournalEntry, PlantsPayload } from "./types";

type Listener = (payload: PlantsPayload) => void;

interface Shared {
  listeners: Set<Listener>;
  last?: PlantsPayload;
  unsubscribe?: Promise<() => Promise<void>>;
}

// One subscription per connection, shared by every Rootwise card on the page.
const shared = new WeakMap<HassConnection, Shared>();

export function subscribePlants(hass: HomeAssistant, listener: Listener): () => void {
  const connection = hass.connection;
  let entry = shared.get(connection);
  if (!entry) {
    const created: Shared = { listeners: new Set() };
    created.unsubscribe = connection.subscribeMessage<PlantsPayload>(
      (payload) => {
        created.last = payload;
        created.listeners.forEach((fn) => fn(payload));
      },
      { type: "rootwise/plants/subscribe" },
    );
    shared.set(connection, created);
    entry = created;
  }
  const current = entry;
  current.listeners.add(listener);
  if (current.last) listener(current.last);

  return () => {
    current.listeners.delete(listener);
    if (current.listeners.size === 0) {
      shared.delete(connection);
      void current.unsubscribe?.then((unsub) => unsub()).catch(() => undefined);
    }
  };
}

export async function logCare(
  hass: HomeAssistant,
  plantId: string,
  careType: string,
  when?: Date,
): Promise<JournalEntry> {
  const message: Record<string, unknown> = {
    type: "rootwise/care/log",
    plant_id: plantId,
    care_type: careType,
  };
  if (when) message.when = when.toISOString();
  const result = await hass.callWS<{ entry: JournalEntry }>(message);
  return result.entry;
}

export async function deleteCare(hass: HomeAssistant, entryId: string): Promise<void> {
  await hass.callWS({ type: "rootwise/care/delete", entry_id: entryId });
}

export async function snooze(hass: HomeAssistant, entityId: string): Promise<void> {
  await hass.callWS({
    type: "call_service",
    domain: "button",
    service: "press",
    target: { entity_id: entityId },
  });
}

/** Admins may delete everything, others only what they logged themselves. */
export function canDelete(hass: HomeAssistant, entry: JournalEntry): boolean {
  const user = hass.user;
  if (!user) return false;
  return user.is_admin || (entry.user_id !== undefined && entry.user_id === user.id);
}
