'use client'

import React, { useEffect } from 'react';
import { Sidebar } from '@/presentation/components/layout/Sidebar';
import { TopNav } from '@/presentation/components/layout/TopNav';
import { useAppSelector, useAppDispatch } from '@/presentation/hooks/redux';
import { checkSession } from '@/presentation/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user, loading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // Initial session check
        dispatch(checkSession());
    }, [dispatch]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tik-cyan"></div>
            </div>
        );
    }

    if (!user) return null; // Logic handled in useEffect, just return null to avoid flash

    return (
        <div className="min-h-screen bg-[#050505] text-foreground font-sans selection:bg-tik-cyan selection:text-black">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: "url('/hero-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-black via-[#050505] to-[#0a0a0a] opacity-90" />

            <Sidebar />
            <TopNav />
            <main className="pl-64 pt-16 min-h-screen relative z-10">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
