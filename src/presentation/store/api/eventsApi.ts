import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

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
                return { data: data as Event };
            },
            invalidatesTags: ['Events'],
        }),
        inviteParticipants: builder.mutation<void, { event_id: string; user_ids: string[] }>({
            queryFn: async ({ event_id, user_ids }) => {
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
    useRespondToInviteMutation
} = eventsApi;
