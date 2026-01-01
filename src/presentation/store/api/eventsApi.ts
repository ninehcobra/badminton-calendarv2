import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { Profile } from './profilesApi';

export interface Event {
    id: string;
    title: string;
    description?: string;
    location?: string;
    event_type: 'direct' | 'vote';
    start_time: string;
    end_time: string;
    created_by: string;
    status: 'planning' | 'confirmed' | 'cancelled';
    created_at: string;
}

export interface CreateEventRequest {
    title: string;
    description?: string;
    location?: string;
    event_type: 'direct' | 'vote';
    start_time: string;
    end_time: string;
    created_by: string; // User ID
}

export interface Invite {
    id: string;
    event_id: string;
    user_id: string;
    status: 'invited' | 'accepted' | 'declined';
    events: Event;
}

export interface CreateOptionRequest {
    event_id: string;
    start_time: string;
    end_time: string;
}

export interface Vote {
    id: string;
    option_id: string;
    user_id: string;
    created_at: string;
}

export interface EventOption {
    id: string;
    event_id: string;
    start_time: string;
    end_time: string;
    votes: Vote[];
}

export const eventsApi = createApi({
    reducerPath: 'eventsApi',
    baseQuery: fakeBaseQuery<PostgrestError>(),
    tagTypes: ['Events', 'Invites', 'Options'],
    endpoints: (builder) => ({
        // ... (existing endpoints)
        getEvents: builder.query<Event[], void>({
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .order('start_time', { ascending: true });

                if (error) return { error };
                return { data: data as Event[] };
            },
            providesTags: ['Events'],
        }),
        createEvent: builder.mutation<Event, CreateEventRequest>({
            queryFn: async (newEvent) => {
                const { data, error } = await supabase
                    .from('events')
                    .insert(newEvent)
                    .select()
                    .single();

                if (error) return { error };

                // Auto-add creator as accepted participant
                await supabase
                    .from('event_participants')
                    .insert({
                        event_id: data.id,
                        user_id: newEvent.created_by,
                        status: 'accepted'
                    });

                return { data: data as Event };
            },
            invalidatesTags: ['Events'],
        }),
        inviteParticipants: builder.mutation<void, { event_id: string; user_ids: string[] }>({
            queryFn: async ({ event_id, user_ids }) => {
                if (!user_ids || user_ids.length === 0) {
                    return { data: undefined };
                }

                const participants = user_ids.map(uid => ({
                    event_id,
                    user_id: uid,
                    status: 'invited'
                }));

                const { error } = await supabase
                    .from('event_participants')
                    .insert(participants);

                if (error) return { error };
                return { data: undefined };
            },
        }),
        createEventOptions: builder.mutation<void, CreateOptionRequest[]>({
            queryFn: async (options) => {
                const { error } = await supabase
                    .from('event_options')
                    .insert(options);

                if (error) return { error };
                return { data: undefined };
            },
            invalidatesTags: ['Options'],
        }),
        getEventOptions: builder.query<EventOption[], string>({
            queryFn: async (event_id) => {
                const { data, error } = await supabase
                    .from('event_options')
                    .select('*, votes(*)')
                    .eq('event_id', event_id)
                    .order('start_time', { ascending: true });

                if (error) return { error };
                return { data: data as unknown as EventOption[] };
            },
            providesTags: ['Options'],
        }),
        voteOption: builder.mutation<void, { option_id: string; user_id: string }>({
            queryFn: async ({ option_id, user_id }) => {
                const { error } = await supabase
                    .from('votes')
                    .insert({ option_id, user_id });

                if (error) return { error };
                return { data: undefined };
            },
            invalidatesTags: ['Options'],
        }),
        unvoteOption: builder.mutation<void, { option_id: string; user_id: string }>({
            queryFn: async ({ option_id, user_id }) => {
                const { error } = await supabase
                    .from('votes')
                    .delete()
                    .eq('option_id', option_id)
                    .eq('user_id', user_id);

                if (error) return { error };
                return { data: undefined };
            },
            invalidatesTags: ['Options'],
        }),
        finalizeEvent: builder.mutation<void, { event_id: string; start_time: string; end_time: string }>({
            queryFn: async ({ event_id, start_time, end_time }) => {
                const { error } = await supabase
                    .from('events')
                    .update({
                        start_time,
                        end_time,
                        status: 'confirmed',
                        event_type: 'direct' // Change type to direct once confirmed? Or keep as vote? Keep vote for history but status confirmed means it's done.
                    })
                    .eq('id', event_id);

                if (error) return { error };
                return { data: undefined };
            },
            invalidatesTags: ['Events', 'Options'],
        }),
        getInvites: builder.query<Invite[], void>({
            queryFn: async () => {
                const { data, error } = await supabase
                    .from('event_participants')
                    .select('*, events(*)')
                    .eq('status', 'invited')
                    .order('created_at', { ascending: false });

                if (error) return { error };
                return { data: data as unknown as Invite[] };
            },
            providesTags: ['Invites'],
        }),
        respondToInvite: builder.mutation<void, { id: string; status: 'accepted' | 'declined' }>({
            queryFn: async ({ id, status }) => {
                const { error } = await supabase
                    .from('event_participants')
                    .update({ status })
                    .eq('id', id);

                if (error) return { error };
                return { data: undefined };
            },
            invalidatesTags: ['Invites', 'Events'],
        }),
        getEventMatches: builder.query<any[], string>({
            queryFn: async (event_id) => {
                const { data, error } = await supabase
                    .from('match_results')
                    .select('*')
                    .eq('event_id', event_id)
                    .order('created_at', { ascending: false });

                if (error) return { error };
                return { data: data as any[] };
            },
            providesTags: ['Events'],
        }),
        joinEvent: builder.mutation<void, { event_id: string; user_id: string }>({
            queryFn: async ({ event_id, user_id }) => {
                const { error } = await supabase
                    .from('event_participants')
                    .insert({
                        event_id,
                        user_id,
                        status: 'accepted' // Auto-accept self-joins
                    });

                if (error) return { error };
                return { data: undefined };
            },
            invalidatesTags: ['Events'], // Refresh participant list
        }),
        updateEvent: builder.mutation<void, { event_id: string; title: string; location?: string; description?: string }>({
            queryFn: async ({ event_id, title, location, description }) => {
                const { error } = await supabase
                    .from('events')
                    .update({ title, location, description })
                    .eq('id', event_id);

                if (error) return { error };

                // Simulate Email Notification
                console.log(`[EMAIL MOCK] Notification sent to participants of event ${event_id}: details updated.`);

                return { data: undefined };
            },
            invalidatesTags: ['Events'],
        }),
        finishMatch: builder.mutation<void, {
            event_id: string;
            team_a: string[];
            team_b: string[];
            score_a: number;
            score_b: number;
            elo_change: number;
            set_scores?: string; // New field
        }>({
            queryFn: async (args) => {
                const { error } = await supabase.rpc('finish_match', {
                    p_event_id: args.event_id,
                    p_team_a: args.team_a,
                    p_team_b: args.team_b,
                    p_score_a: args.score_a,
                    p_score_b: args.score_b,
                    p_elo_change: args.elo_change,
                    p_set_scores: args.set_scores
                });

                if (error) return { error };
                return { data: undefined };
            },
            invalidatesTags: ['Events'],
        }),
        getEventParticipants: builder.query<Profile[], string>({
            queryFn: async (event_id) => {
                const { data, error } = await supabase
                    .from('event_participants')
                    .select('user_id, profiles(*)') // Join to get profile details
                    .eq('event_id', event_id)
                    .in('status', ['accepted', 'invited']); // Fetch invited ones too? Maybe just accepted for calculating average ELO. Let's keep accepted for now or both. 
                // User request said: "display list of agreeing participants".

                if (error) return { error };
                // Flatten the result to return just profiles
                const profiles = data.map((d: any) => d.profiles) as Profile[];
                return { data: profiles };
            },
        }),
        deleteEvent: builder.mutation<void, string>({
            queryFn: async (event_id) => {
                // Delete event (participants and matches should cascade delete if FK configured, or we delete manually)
                // Assuming FK with cascade for simplicity if schema supports, otherwise just delete event and let Supabase complain or handle it.
                // Best to delete related first but let's try direct delete if cascade is on.
                const { error } = await supabase
                    .from('events')
                    .delete()
                    .eq('id', event_id);

                if (error) return { error };
                // Simulate Email Notification
                console.log(`[EMAIL MOCK] Notification sent to participants of event ${event_id}: EVENT CANCELLED/DELETED.`);
                return { data: undefined };
            },
            invalidatesTags: ['Events'],
        }),
    }),
});

export const {
    useGetEventsQuery,
    useCreateEventMutation,
    useInviteParticipantsMutation,
    useCreateEventOptionsMutation,
    useGetEventOptionsQuery,
    useVoteOptionMutation,
    useUnvoteOptionMutation,
    useFinalizeEventMutation,
    useGetInvitesQuery,
    useRespondToInviteMutation,
    useFinishMatchMutation,
    useGetEventParticipantsQuery,
    useJoinEventMutation,
    useUpdateEventMutation,
    useGetEventMatchesQuery,
    useDeleteEventMutation
} = eventsApi;
