import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from './slices/authSlice'
import calendarReducer from './slices/calendarSlice'
import uiReducer from './slices/uiSlice'
import { eventsApi } from './api/eventsApi'
import { profilesApi } from './api/profilesApi'
import { courtsApi } from './api/courtsApi'
import { rtkQueryToastMiddleware } from './middleware/toastMiddleware'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        calendar: calendarReducer,
        ui: uiReducer,
        [eventsApi.reducerPath]: eventsApi.reducer,
        [profilesApi.reducerPath]: profilesApi.reducer,
        [courtsApi.reducerPath]: courtsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(rtkQueryToastMiddleware)
            .concat(eventsApi.middleware)
            .concat(profilesApi.middleware)
            .concat(courtsApi.middleware),
})

setupListeners(store.dispatch)

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
