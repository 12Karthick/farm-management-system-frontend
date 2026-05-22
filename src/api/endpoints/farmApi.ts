import { baseApi } from "../baseApi";
import type { Farm, CreateFarmRequest, UpdateFarmRequest } from "../types.ts/farm.types";

interface BackendResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export const farmApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createFarm: builder.mutation<Farm, CreateFarmRequest>({
            query: (body) => ({
                url: "/farm",
                method: "POST",
                body,
            }),
            transformResponse: (response: BackendResponse<Farm>) => response.data,
            invalidatesTags: ["Farm"],
        }),

        getFarms: builder.query<Farm[], void>({
            query: () => "/farm",
            transformResponse: (response: BackendResponse<Farm[]>) => response.data,
            providesTags: ["Farm"],
        }),

        getFarmById: builder.query<Farm, string>({
            query: (id) => `/farm/${id}`,
            transformResponse: (response: BackendResponse<Farm>) => response.data,
            providesTags: ["Farm"],
        }),

        updateFarm: builder.mutation<Farm, UpdateFarmRequest>({
            query: ({ id, body }) => ({
                url: `/farm/${id}`,
                method: "PATCH",
                body,
            }),
            transformResponse: (response: BackendResponse<Farm>) => response.data,
            invalidatesTags: ["Farm"],
        }),

        deleteFarm: builder.mutation<void, string>({
            query: (id) => ({
                url: `/farm/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Farm"],
        }),

        getFarmsByCompanyId: builder.query<Farm[], string>({
            query: (companyId) => `/farm/company/${companyId}`,
            transformResponse: (response: BackendResponse<Farm[]>) => response.data,
            providesTags: ["Farm"],
        }),
    }),
});

export const {
    useCreateFarmMutation,
    useGetFarmsQuery,
    useGetFarmByIdQuery,
    useGetFarmsByCompanyIdQuery,
    useUpdateFarmMutation,
    useDeleteFarmMutation,
} = farmApi;