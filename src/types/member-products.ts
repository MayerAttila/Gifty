export type MemberProduct = {
  id: string;
  memberId: number;
  name: string;
  url?: string;
  priceValue?: number;
  priceDisplay: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type MemberProductFormValues = {
  name: string;
  url: string;
  price: string;
  notes: string;
};
