import { baseApi } from "../baseApi";
import type { FarmPerson, CreateFarmPersonRequest, UpdateFarmPersonRequest } from "../types.ts/farmPerson.types";

interface BackendResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export const farmPersonApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createFarmPerson: builder.mutation<FarmPerson, CreateFarmPersonRequest>({
            query: (body) => ({
                url: "/farm-persons",
                method: "POST",
                body,
            }),
            transformResponse: (response: BackendResponse<FarmPerson>) => response.data,
            invalidatesTags: ["FarmPerson"],
        }),

        getFarmPersons: builder.query<FarmPerson[], void>({
            query: () => "/farm-persons",
            transformResponse: (response: BackendResponse<FarmPerson[]>) => response.data,
            providesTags: ["FarmPerson"],
        }),

        getFarmPersonById: builder.query<FarmPerson, string>({
            query: (id) => `/farm-persons/${id}`,
            transformResponse: (response: BackendResponse<FarmPerson>) => response.data,
            providesTags: ["FarmPerson"],
        }),

        updateFarmPerson: builder.mutation<FarmPerson, UpdateFarmPersonRequest>({
            query: ({ id, body }) => ({
                url: `/farm-persons/${id}`,
                method: "PATCH",
                body,
            }),
            transformResponse: (response: BackendResponse<FarmPerson>) => response.data,
            invalidatesTags: ["FarmPerson"],
        }),

        deleteFarmPerson: builder.mutation<void, string>({
            query: (id) => ({
                url: `/farm-persons/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["FarmPerson"],
        }),
    }),
});

export const {
    useCreateFarmPersonMutation,
    useGetFarmPersonsQuery,
    useGetFarmPersonByIdQuery,
    useUpdateFarmPersonMutation,
    useDeleteFarmPersonMutation,
} = farmPersonApi;
