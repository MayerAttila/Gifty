export type Member = {
  id: number;
  name: string;
  birthday?: Date;
  gender: string;
  connection: string;
  likings?: string;
  specialDates?: Array<{ label: string; date: Date }>;
};

export type AddMemberFormValues = Omit<Member, "id">;

export type FormState = {
  name: string;
  gender: string;
  birthday: string;
  connection: string;
  likings: string;
  specialDates: Array<{ label: string; date: string }>;
};
