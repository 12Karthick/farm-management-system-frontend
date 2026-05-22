import { baseApi } from "../baseApi";
import type { FunctionGroup, CreateFunctionGroupRequest, UpdateFunctionGroupRequest } from "../types.ts/functionGroup.types";

interface BackendResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export const functionGroupApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createFunctionGroup: builder.mutation<FunctionGroup, CreateFunctionGroupRequest>({
            query: (body) => ({
                url: "/function-group",
                method: "POST",
                body,
            }),
            transformResponse: (response: BackendResponse<FunctionGroup>) => response.data,
            invalidatesTags: ["FunctionGroup"],
        }),

        getFunctionGroups: builder.query<FunctionGroup[], void>({
            query: () => "/function-group",
            transformResponse: (response: BackendResponse<FunctionGroup[]>) => response.data,
            providesTags: ["FunctionGroup"],
        }),

        getFunctionGroupById: builder.query<FunctionGroup, string>({
            query: (id) => `/function-group/${id}`,
            transformResponse: (response: BackendResponse<FunctionGroup>) => response.data,
            providesTags: ["FunctionGroup"],
        }),

        updateFunctionGroup: builder.mutation<FunctionGroup, UpdateFunctionGroupRequest>({
            query: ({ id, body }) => ({
                url: `/function-group/${id}`,
                method: "PATCH",
                body,
            }),
            transformResponse: (response: BackendResponse<FunctionGroup>) => response.data,
            invalidatesTags: ["FunctionGroup"],
        }),

        deleteFunctionGroup: builder.mutation<void, string>({
            query: (id) => ({
                url: `/function-group/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["FunctionGroup"],
        }),

        getFunctionGroupsByFarmId: builder.query<FunctionGroup[], string>({
            query: (farmId) => `/function-group/farm/${farmId}`,
            transformResponse: (response: BackendResponse<FunctionGroup[]>) => response.data,
            providesTags: ["FunctionGroup"],
        }),
    }),
});

export const {
    useCreateFunctionGroupMutation,
    useGetFunctionGroupsQuery,
    useGetFunctionGroupByIdQuery,
    useGetFunctionGroupsByFarmIdQuery,
    useUpdateFunctionGroupMutation,
    useDeleteFunctionGroupMutation,
} = functionGroupApi;