import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface Profile {
    id: string;
    display_name: string;
    avatar_url?: string;
    rank_score: number;
    rank_tier: string;
}

export const profilesApi = createApi({
    reducerPath: 'profilesApi',
    baseQuery: fakeBaseQuery<PostgrestError>(),
    endpoints: (builder) => ({
        searchProfiles: builder.query<Profile[], string>({
            queryFn: async (searchTerm) => {
                if (!searchTerm || searchTerm.length < 2) return { data: [] };

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .ilike('display_name', `%${searchTerm}%`)
                    .limit(5);

                if (error) return { error };
                return { data: data as Profile[] };
            },
        }),
        getProfile: builder.query<Profile, string>({
            queryFn: async (userId) => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) return { error };
                return { data: data as Profile };
            },
        }),
    }),
});

export const { useSearchProfilesQuery, useLazySearchProfilesQuery, useGetProfileQuery } = profilesApi;
