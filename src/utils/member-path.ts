import type { Member } from "../types/add-member";

const stripDiacritics = (value: string) =>
  value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

export const toMemberSlug = (name: string, fallbackId?: number): string => {
  const base = stripDiacritics(`${name ?? ""}`)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (base) {
    return base;
  }

  return fallbackId != null ? `member-${fallbackId}` : "member";
};

export const buildMemberProductsPath = (
  member: Pick<Member, "name" | "id">
) =>
  `/Members/${toMemberSlug(member.name, member.id)}`;

export const findMemberBySlug = (
  members: Member[],
  slug: string
): Member | undefined => {
  const normalizedSlug = slug.trim().toLowerCase();
  return members.find(
    (member) => toMemberSlug(member.name, member.id) === normalizedSlug
  );
};
