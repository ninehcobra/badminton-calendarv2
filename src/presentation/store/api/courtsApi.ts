import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface Court {
    id: string;
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    description?: string;
    created_by: string;
    created_at: string;
}

export interface CourtReview {
    id: string;
    court_id: string;
    user_id: string;
    rating: number; // 1-5
    comment?: string;
    created_at: string;
    profiles?: {
        display_name: string;
        avatar_url?: string;
    };
}

export interface CreateCourtRequest {
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    description?: string;
    created_by: string; // user id
}

export interface CreateReviewRequest {
    court_id: string;
    user_id: string;
    rating: number;
    comment?: string;
}

export const courtsApi = createApi({
    reducerPath: 'courtsApi',
    baseQuery: fakeBaseQuery<PostgrestError>(),
    tagTypes: ['Courts', 'Reviews'],
    endpoints: (builder) => ({
        getCourts: builder.query<Court[], void>({
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('courts')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) return { error };
                return { data: data as Court[] };
            },
            providesTags: ['Courts'],
        }),
        addCourt: builder.mutation<Court, CreateCourtRequest>({
            queryFn: async (newCourt) => {
                const { data, error } = await supabase
                    .from('courts')
                    .insert(newCourt)
                    .select()
                    .single();

                if (error) return { error };
                return { data: data as Court };
            },
            invalidatesTags: ['Courts'],
        }),
        getReviews: builder.query<CourtReview[], string>({
            queryFn: async (court_id) => {
                const { data, error } = await supabase
                    .from('court_reviews')
                    .select('*, profiles(display_name, avatar_url)')
                    .eq('court_id', court_id)
                    .order('created_at', { ascending: false });

                if (error) return { error };
                // Flattening is done by supabase return structure usually matching what we asked.
                // data[i].profiles will be object { display_name, avatar_url }
                // We map this slightly if needed or just use as is.
                return { data: data as unknown as CourtReview[] };
            },
            providesTags: (result, error, arg) => [{ type: 'Reviews', id: arg }],
        }),
        addReview: builder.mutation<CourtReview, CreateReviewRequest>({
            queryFn: async (review) => {
                const { data, error } = await supabase
                    .from('court_reviews')
                    .insert(review)
                    .select('*, profiles(display_name, avatar_url)')
                    .single();

                if (error) return { error };
                return { data: data as unknown as CourtReview };
            },
            invalidatesTags: (result, error, arg) => ['Reviews', { type: 'Reviews', id: arg.court_id }],
        }),
    }),
});

export const {
    useGetCourtsQuery,
    useAddCourtMutation,
    useGetReviewsQuery,
    useAddReviewMutation
} = courtsApi;
