'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useGetCourtsQuery } from '@/presentation/store/api/courtsApi';

// Dynamically import the map component to avoid SSR issues with Leaflet
const CourtMapClient = dynamic(() => import('@/presentation/features/map/CourtMapClient'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-gray-500">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-tik-cyan border-t-transparent rounded-full animate-spin"></div>
                <p>Đang tải bản đồ...</p>
            </div>
        </div>
    )
});

export default function MapPage() {
    const { data: courts = [], isLoading } = useGetCourtsQuery();

    return (
        <div className="h-[80vh] w-full relative rounded-2xl overflow-hidden border border-[#333] shadow-2xl">
            <CourtMapClient courts={courts} />
        </div>
    );
}
