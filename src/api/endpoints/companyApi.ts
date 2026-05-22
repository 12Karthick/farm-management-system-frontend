import { baseApi } from "../baseApi";
import type { Company, CreateCompanyRequest, UpdateCompanyRequest } from "../types.ts/company.types";

interface BackendResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export const companyApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCompany: builder.mutation<Company, CreateCompanyRequest>({
            query: (body) => ({
                url: "/company",
                method: "POST",
                body,
            }),
            transformResponse: (response: BackendResponse<Company>) => response.data,
            invalidatesTags: ["Company"],
        }),

        getCompanies: builder.query<Company[], void>({
            query: () => "/company",
            transformResponse: (response: BackendResponse<Company[]>) => response.data,
            providesTags: ["Company"],
        }),

        getCompanyById: builder.query<Company, string>({
            query: (id) => `/company/${id}`,
            transformResponse: (response: BackendResponse<Company>) => response.data,
            providesTags: ["Company"],
        }),

        updateCompany: builder.mutation<Company, UpdateCompanyRequest>({
            query: ({ id, body }) => ({
                url: `/company/${id}`,
                method: "PATCH",
                body,
            }),
            transformResponse: (response: BackendResponse<Company>) => response.data,
            invalidatesTags: ["Company"],
        }),

        deleteCompany: builder.mutation<void, string>({
            query: (id) => ({
                url: `/company/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Company"],
        }),
    }),
});

export const {
    useCreateCompanyMutation,
    useGetCompaniesQuery,
    useGetCompanyByIdQuery,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
} = companyApi;