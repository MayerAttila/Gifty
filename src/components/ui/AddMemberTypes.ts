export type MemberType = "family" | "friend" | "coworker" | "other";

export type AddMemberFormValues = {
  name: string;
  gender: string;
  age: number;
  birthday: string;
  memberType: MemberType;
  relationship?: string;
  connectedSince?: string;
  preferences?: string;
  specialDates?: Array<{ label: string; date: string }>;
};

export type FormState = {
  name: string;
  gender: string;
  age: string;
  birthday: string;
  memberType: MemberType;
  relationship: string;
  connectedSince: string;
  preferences: string;
  specialDates: Array<{ label: string; date: string }>;
};

