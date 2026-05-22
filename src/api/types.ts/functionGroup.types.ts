import type { Farm } from "./farm.types";

export interface FunctionGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  status: boolean;
  farm: Farm;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFunctionGroupRequest {
  name: string;
  code: string;
  description?: string;
  farmId: string;
}

export interface UpdateFunctionGroupRequest {
  id: string;
  body: Partial<CreateFunctionGroupRequest>;
}
