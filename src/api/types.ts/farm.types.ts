import type { Company } from "./company.types";

export interface Farm {
  farmId: string;
  farmName: string;
  farmDescription: string;
  isActive: boolean;
  company: Company;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFarmRequest {
  farmName: string;
  farmDescription?: string;
  companyId: string;
}

export interface UpdateFarmRequest {
  id: string;
  body: Partial<CreateFarmRequest>;
}
