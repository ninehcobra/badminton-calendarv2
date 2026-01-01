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

export interface MatchResult {
    id: string;
    event_id: string;
    team_a_ids: string[];
    team_b_ids: string[];
    score_a: number;
    score_b: number;
    elo_change: number;
    winner_team: 'A' | 'B' | 'Draw';
    created_at: string;
    events: {
        title: string;
        start_time: string;
    };
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
        getLeaderboard: builder.query<Profile[], void>({
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('rank_score', { ascending: false })
                    .limit(50);

                if (error) return { error };
                return { data: data as Profile[] };
            },
        }),
        getMatchHistory: builder.query<MatchResult[], string>({
            queryFn: async (userId) => {
                const { data, error } = await supabase
                    .from('match_results')
                    .select('*, events(title, start_time)')
                    .or(`team_a_ids.cs.{${userId}},team_b_ids.cs.{${userId}}`) // Check if user id is in team_a_ids OR team_b_ids arrays
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) return { error };
                return { data: data as unknown as MatchResult[] };
            },
        }),
    }),
});

export const { useSearchProfilesQuery, useLazySearchProfilesQuery, useGetProfileQuery, useGetLeaderboardQuery, useGetMatchHistoryQuery } = profilesApi;
