import type {
  MemberProduct,
  MemberProductFormValues,
} from "../types/member-products";

export const MEMBER_PRODUCTS_STORAGE_KEY = "gifty:member-products";
export const MEMBER_PRODUCTS_UPDATED_EVENT = "gifty:member-products-updated";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const reviveMemberProduct = (candidate: unknown): MemberProduct | null => {
  if (!isRecord(candidate)) {
    return null;
  }

  const {
    id,
    memberId,
    name,
    url,
    priceValue,
    priceDisplay,
    notes,
    createdAt,
    updatedAt,
  } = candidate;

  if (
    typeof id !== "string" ||
    typeof memberId !== "number" ||
    typeof name !== "string" ||
    typeof createdAt !== "string"
  ) {
    return null;
  }

  const normalized: MemberProduct = {
    id,
    memberId,
    name,
    createdAt,
  };

  if (typeof url === "string" && url.trim()) {
    normalized.url = url.trim();
  }

  if (typeof notes === "string" && notes.trim()) {
    normalized.notes = notes.trim();
  }

  if (typeof priceDisplay === "string" && priceDisplay.trim()) {
    normalized.priceDisplay = priceDisplay.trim();
  }

  if (typeof priceValue === "number" && Number.isFinite(priceValue)) {
    normalized.priceValue = priceValue;
  }

  if (typeof updatedAt === "string") {
    normalized.updatedAt = updatedAt;
  }

  return normalized;
};

export const loadMemberProductsFromStorage = (): MemberProduct[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(MEMBER_PRODUCTS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map(reviveMemberProduct)
      .filter((product): product is MemberProduct => product !== null);
  } catch {
    return [];
  }
};

export const saveMemberProductsToStorage = (products: MemberProduct[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    MEMBER_PRODUCTS_STORAGE_KEY,
    JSON.stringify(products)
  );

  window.dispatchEvent(new Event(MEMBER_PRODUCTS_UPDATED_EVENT));
};

export const createProductFromForm = (
  memberId: number,
  values: MemberProductFormValues
): MemberProduct => {
  const now = new Date().toISOString();

  const trimmedName = values.name.trim();
  const trimmedUrl = values.url.trim();
  const trimmedNotes = values.notes.trim();
  const trimmedPrice = values.price.trim();

  let priceValue: number | undefined;
  if (trimmedPrice) {
    const normalized = Number.parseFloat(
      trimmedPrice.replace(/[^0-9.,]/g, "").replace(",", ".")
    );
    if (!Number.isNaN(normalized)) {
      priceValue = normalized;
    }
  }

  const cryptoApi = typeof globalThis !== "undefined" ? globalThis.crypto : null;

  const id =
    cryptoApi && typeof cryptoApi.randomUUID === "function"
      ? cryptoApi.randomUUID()
      : `mp-${Date.now()}-${Math.round(Math.random() * 10_000)}`;

  return {
    id,
    memberId,
    name: trimmedName,
    createdAt: now,
    ...(trimmedUrl ? { url: trimmedUrl } : {}),
    ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    ...(trimmedPrice ? { priceDisplay: trimmedPrice } : {}),
    ...(priceValue != null ? { priceValue } : {}),
  };
};
