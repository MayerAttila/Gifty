import type { Member } from "../types/add-member";

export const MEMBERS_STORAGE_KEY = "gifty:members";
export const MEMBERS_UPDATED_EVENT = "gifty:members-updated";

const reviveMember = (candidate: unknown): Member | null => {
  if (typeof candidate !== "object" || candidate === null) {
    return null;
  }

  const { id, name, gender, connection, likings, specialDates, birthday } =
    candidate as {
      id?: unknown;
      name?: unknown;
      gender?: unknown;
      connection?: unknown;
      likings?: unknown;
      specialDates?: unknown;
      birthday?: unknown;
    };

  if (
    typeof id !== "number" ||
    typeof name !== "string" ||
    typeof gender !== "string" ||
    typeof connection !== "string"
  ) {
    return null;
  }

  const datesMap = new Map<string, { label: string; date: Date }>();

  if (Array.isArray(specialDates)) {
    specialDates.forEach((entry) => {
      if (typeof entry !== "object" || entry === null) {
        return;
      }

      const { label, date } = entry as {
        label?: unknown;
        date?: unknown;
      };

      if (typeof label !== "string") {
        return;
      }

      const trimmedLabel = label.trim();
      if (!trimmedLabel) {
        return;
      }

      const parsed =
        date instanceof Date
          ? new Date(date.getTime())
          : typeof date === "string"
          ? new Date(date)
          : null;

      if (!parsed || Number.isNaN(parsed.getTime())) {
        return;
      }

      datesMap.set(trimmedLabel.toLowerCase(), {
        label: trimmedLabel,
        date: parsed,
      });
    });
  }

  if (typeof birthday === "string" || birthday instanceof Date) {
    const parsed =
      birthday instanceof Date
        ? new Date(birthday.getTime())
        : new Date(birthday);
    if (!Number.isNaN(parsed.getTime())) {
      datesMap.set("birthday", { label: "Birthday", date: parsed });
    }
  }

  const normalizedSpecialDates = Array.from(datesMap.values());

  return {
    id,
    name,
    gender,
    connection,
    ...(typeof likings === "string" ? { likings } : {}),
    ...(normalizedSpecialDates.length > 0
      ? { specialDates: normalizedSpecialDates }
      : {}),
  };
};

export const loadMembersFromStorage = (): Member[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(MEMBERS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map(reviveMember)
      .filter((member): member is Member => member !== null);
  } catch {
    return [];
  }
};

export const saveMembersToStorage = (members: Member[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    MEMBERS_STORAGE_KEY,
    JSON.stringify(members, (_, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    })
  );

  window.dispatchEvent(new Event(MEMBERS_UPDATED_EVENT));
};
