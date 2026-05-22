import { baseApi } from "../baseApi";
import type { Area, CreateAreaRequest, UpdateAreaRequest } from "../types.ts/area.types";

interface BackendResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export const areaApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createArea: builder.mutation<Area, CreateAreaRequest>({
            query: (body) => ({
                url: "/area",
                method: "POST",
                body,
            }),
            transformResponse: (response: BackendResponse<Area>) => response.data,
            invalidatesTags: ["Area"],
        }),

        getAreas: builder.query<Area[], void>({
            query: () => "/area",
            transformResponse: (response: BackendResponse<Area[]>) => response.data,
            providesTags: ["Area"],
        }),

        getAreaById: builder.query<Area, string>({
            query: (id) => `/area/${id}`,
            transformResponse: (response: BackendResponse<Area>) => response.data,
            providesTags: ["Area"],
        }),

        updateArea: builder.mutation<Area, UpdateAreaRequest>({
            query: ({ id, body }) => ({
                url: `/area/${id}`,
                method: "PATCH",
                body,
            }),
            transformResponse: (response: BackendResponse<Area>) => response.data,
            invalidatesTags: ["Area"],
        }),

        deleteArea: builder.mutation<void, string>({
            query: (id) => ({
                url: `/area/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Area"],
        }),

        getAreasByFarmId: builder.query<Area[], string>({
            query: (farmId) => `/area/farm/${farmId}`,
            transformResponse: (response: BackendResponse<Area[]>) => response.data,
            providesTags: ["Area"],
        }),
    }),
});

export const {
    useCreateAreaMutation,
    useGetAreasQuery,
    useGetAreaByIdQuery,
    useGetAreasByFarmIdQuery,
    useUpdateAreaMutation,
    useDeleteAreaMutation,
} = areaApi;