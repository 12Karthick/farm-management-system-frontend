import type { Company } from "./company.types";
import type { Farm } from "./farm.types";
import type { Area } from "./area.types";
import type { FunctionGroup } from "./functionGroup.types";

export interface FarmPersonAreaMapping {
  areaMappingId: string;
  isActive: boolean;
  farmRole: string;
  area: Area;
}

export interface FarmPersonFunctionGroupMapping {
  isActive: boolean;
  farmRole: string;
  functionGroup: FunctionGroup;
}

export interface FarmPerson {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  employeeCode?: string;
  farmRoleNumber: string;
  farmRole: string;
  status: boolean;
  company: Company;
  farm?: Farm;
  areaMappings?: FarmPersonAreaMapping[];
  functionGroupMappings?: FarmPersonFunctionGroupMapping[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFarmPersonRequest {
  firstName: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
  employeeCode?: string;
  farmRole: string;
  farmRoleNumber: string;
  areaIds?: string[];
  functionGroupIds?: string[];
  companyId: string;
  farmId: string;
  status?: boolean;
}

export interface UpdateFarmPersonRequest {
  id: string;
  body: Partial<CreateFarmPersonRequest>;
}
