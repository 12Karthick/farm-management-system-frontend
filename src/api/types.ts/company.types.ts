export interface Company {
  companyId: string;
  companyName: string;
  registrationNumber: string;
  companyMail: string;
  website: string;
  address: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyRequest {
  companyName: string;
  registrationNumber: string;
  companyMail: string;
  website: string;
  address: string;
  isActive?: boolean;
}

export interface UpdateCompanyRequest {
  id: string;
  body: Partial<CreateCompanyRequest>;
}
