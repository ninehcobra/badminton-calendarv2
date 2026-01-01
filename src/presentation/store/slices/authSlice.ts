import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Define the initial state using that type
interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    session: null,
    loading: true, // Initial loading true to check session
    error: null,
};

// Async Thunks
export const checkSession = createAsyncThunk(
    'auth/checkSession',
    async (_, { rejectWithValue }) => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            return data.session;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async ({ email, password, fullName }: { email: string; password: string; fullName: string }, { rejectWithValue }) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });
            if (error) throw error;
            // Return full data response (user + session)
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
        },
        setSession: (state, action: PayloadAction<Session | null>) => {
            state.session = action.payload;
            state.user = action.payload?.user || null;
        }
    },
    extraReducers: (builder) => {
        // Check Session
        builder.addCase(checkSession.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(checkSession.fulfilled, (state, action) => {
            state.session = action.payload;
            state.user = action.payload?.user || null;
            state.loading = false;
        });
        builder.addCase(checkSession.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Login
        builder.addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.session = action.payload;
            state.user = action.payload?.user || null;
            state.loading = false;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action) => {
            // Updated to handle { user, session } structure
            state.session = action.payload.session;
            state.user = action.payload.user;
            state.loading = false;
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.session = null;
            state.user = null;
            state.loading = false;
        });
    },
});

export const { setUser, setSession } = authSlice.actions;

export default authSlice.reducer;
