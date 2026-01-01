import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarState {
    viewDate: string; // ISO String to be serializable
    viewMode: CalendarViewMode;
}

const initialState: CalendarState = {
    viewDate: new Date().toISOString(),
    viewMode: 'month', // Default to month view
};

export const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        setViewDate: (state, action: PayloadAction<string>) => {
            state.viewDate = action.payload;
        },
        setViewMode: (state, action: PayloadAction<CalendarViewMode>) => {
            state.viewMode = action.payload;
        },
        nextMonth: (state) => {
            // Logic will be handled in component or thunk if complex, 
            // but for now keeping state simple.
            // It's better to calculate date in component and pass here.
        }
    },
});

export const { setViewDate, setViewMode } = calendarSlice.actions;

export default calendarSlice.reducer;
