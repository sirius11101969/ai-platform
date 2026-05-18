const COOLDOWN_EVENT_TYPES = new Set([
  "ai_followup_skipped_cooldown",
  "cooldown_skip",
]);

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function getEventType(event) {
  return normalizeText(event?.event_type || event?.eventType || event?.type).toLowerCase();
}

function isCooldownEvent(event) {
  const type = getEventType(event);
  if (COOLDOWN_EVENT_TYPES.has(type)) return true;
  const title = normalizeText(event?.title).toLowerCase();
  return type.includes("cooldown") || title.includes("cooldown");
}

function getDateBucket(value) {
  const date = new Date(value || 0);
  if (!Number.isFinite(date.getTime())) return "unknown-date";
  date.setMinutes(0, 0, 0);
  return date.toISOString();
}

function getCooldownLeadName(event, index) {
  const directName = normalizeText(event?.leadName || event?.lead_name || event?.metadata?.leadName || event?.metadata?.lead_name);
  if (directName) return directName;

  const title = normalizeText(event?.title);
  const titleMatch = title.match(/(?:for|для)\s+(.+)$/i);
  if (titleMatch?.[1]) return titleMatch[1].trim();

  const leadId = normalizeText(event?.leadId || event?.lead_id);
  if (leadId) return `Лид ${leadId}`;

  return `Лид #${index + 1}`;
}

function getStableEventKey(event, index) {
  return normalizeText(event?.id || event?.eventId || event?.key || `${getEventType(event) || "event"}-${event?.createdAt || event?.created_at || index}-${index}`);
}

function buildCooldownGroup(bucket) {
  const leadNames = Array.from(bucket.leadNames.values());
  const count = bucket.items.length;
  return {
    ...bucket.items[0],
    id: `cooldown-group-${bucket.key}`,
    key: `cooldown-group-${bucket.key}`,
    type: "cooldown_group",
    grouped: true,
    groupKind: "cooldown",
    title: "Follow-up cooldown prevented duplicates",
    detail: `Cooldown guard предотвратил повторные follow-up для ${count} лидов:`,
    createdAt: bucket.createdAt,
    preventedCount: count,
    badge: `${count} prevented`,
    leadNames,
    sourceEventKeys: bucket.items.map((item, index) => getStableEventKey(item, index)),
  };
}

export function groupSafetyEvents(events = []) {
  if (!Array.isArray(events) || events.length === 0) return [];

  const groupedBuckets = new Map();
  const outputSlots = [];

  events.forEach((event, index) => {
    if (!event || typeof event !== "object" || !isCooldownEvent(event)) {
      outputSlots.push({ kind: "single", item: event, key: getStableEventKey(event, index) });
      return;
    }

    const body = normalizeText(event.detail || event.body);
    const type = getEventType(event) || "cooldown";
    const dateBucket = getDateBucket(event.createdAt || event.created_at);
    const groupKey = `${type}|${body}|${dateBucket}`;
    let bucket = groupedBuckets.get(groupKey);

    if (!bucket) {
      bucket = {
        key: groupKey,
        items: [],
        leadNames: new Map(),
        createdAt: event.createdAt || event.created_at,
        slotIndex: outputSlots.length,
      };
      groupedBuckets.set(groupKey, bucket);
      outputSlots.push({ kind: "cooldown", key: groupKey });
    }

    bucket.items.push(event);
    const leadName = getCooldownLeadName(event, index);
    if (!bucket.leadNames.has(leadName)) bucket.leadNames.set(leadName, leadName);
  });

  return outputSlots.map((slot) => {
    if (slot.kind !== "cooldown") return slot.item;
    const bucket = groupedBuckets.get(slot.key);
    if (!bucket || bucket.items.length === 1) return bucket?.items[0];
    return buildCooldownGroup(bucket);
  }).filter(Boolean);
}
