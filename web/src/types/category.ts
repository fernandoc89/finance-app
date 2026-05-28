export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryStat {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  total: number;
  transactionCount: number;
  percentage: number;
}

export interface CreateCategoryPayload {
  name: string;
  icon: string;
  color: string;
  isActive?: boolean;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
