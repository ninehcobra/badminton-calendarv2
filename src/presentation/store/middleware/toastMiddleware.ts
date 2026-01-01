import { isRejectedWithValue, isFulfilled, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

export const rtkQueryToastMiddleware: Middleware =
    (api: MiddlewareAPI) => (next) => (action: any) => {
        // Check if the action is a rejected action (Error)
        if (isRejectedWithValue(action)) {
            console.warn('Middleware rejected:', action);
            const errorMessage =
                action.payload?.data?.message ||
                action.payload?.message ||
                action.error?.message ||
                'Đã có lỗi xảy ra';

            toast.error(errorMessage, {
                style: {
                    background: '#333',
                    color: '#ff0050', // TikTok Red
                }
            });
        }

        // Check if the action is a fulfilled mutation (Success)
        // RTK Query mutations usually have meta.arg.type = 'mutation'
        // We can also check specific action types or meta flags.
        // For general "always toast", let's be careful not to toast on every GET fetch.
        if (isFulfilled(action)) {
            // Check if it is a mutation by looking at the type or meta
            // Usually RTK Query actions have `meta.arg.type`
            if (action.meta?.arg?.type === 'mutation') {
                toast.success('Thao tác thành công!', {
                    style: {
                        background: '#333',
                        color: '#00f2ea', // TikTok Cyan
                    }
                });
            }
        }

        return next(action);
    };
