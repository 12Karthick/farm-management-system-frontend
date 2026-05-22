import { baseApi } from "../baseApi";

export interface DashboardData {
  totalCompanies: number;
  totalFarms: number;
  totalPersonnel: number;
  totalFunctionGroups: number;
  totalAreas: number;
  farmMasters: number;
  farmAdmins: number;
  farmWorkers: number;
  supportWorkers: number;
  roleDistribution: { role: string; count: number }[];
  personnelGrowthTrend: { month: string; count: number }[];
  companyName?: string;
  farmName?: string;
}

interface BackendResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardData, void>({
      query: () => "/dashboard/summary",
      transformResponse: (response: BackendResponse<DashboardData>) => response.data,
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
