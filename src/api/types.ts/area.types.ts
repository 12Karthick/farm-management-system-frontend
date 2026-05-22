import type { Farm } from "./farm.types";

export interface Area {
  areaId: string;
  areaName: string;
  areaCode: string;
  areaDescription: string;
  isActive: boolean;
  farm: Farm;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAreaRequest {
  areaName: string;
  areaCode: string;
  areaDescription?: string;
  farmId: string;
}

export interface UpdateAreaRequest {
  id: string;
  body: Partial<CreateAreaRequest>;
}
