'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/presentation/hooks/redux';
import { loginUser, checkSession } from '@/presentation/store/slices/authSlice';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user, loading, error } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(checkSession());
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await dispatch(loginUser({ email, password }));
        if (loginUser.fulfilled.match(result)) {
            toast.success('Đăng nhập thành công!');
        } else if (loginUser.rejected.match(result)) {
            toast.error(result.payload as string || 'Đăng nhập thất bại');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 font-sans selection:bg-tik-cyan selection:text-black overflow-hidden relative">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 blur-sm scale-105"
                    style={{ backgroundImage: "url('/hero-bg.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#050505]" />
            </div>

            <div className="w-full max-w-md space-y-8 rounded-[2rem] bg-black/40 backdrop-blur-xl p-10 shadow-2xl border border-white/10 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center flex flex-col items-center">
                    {/* Logo Area */}
                    <Link href="/" className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-tik-cyan/20 to-tik-red/20 border border-white/5 flex items-center justify-center p-4 shadow-lg shadow-tik-cyan/10 group hover:scale-105 transition-transform duration-500 cursor-pointer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/bc-logo.png" alt="BC Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,242,234,0.5)]" />
                    </Link>

                    <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                        Chào Mừng Trở Lại
                    </h2>
                    <p className="text-sm text-gray-400">
                        Đăng nhập vào <span className="text-tik-cyan font-bold">Badminton Calendar</span>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            label="Email"
                            placeholder="example@badminton.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-tik-cyan focus:ring-tik-cyan/20 text-white placeholder:text-gray-600 rounded-xl py-3"
                        />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            label="Mật khẩu"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-tik-cyan focus:ring-tik-cyan/20 text-white placeholder:text-gray-600 rounded-xl py-3"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-tik-cyan to-blue-600 hover:from-tik-cyan/80 hover:to-blue-600/80 text-black font-bold text-lg shadow-[0_0_20px_rgba(0,242,234,0.3)] hover:shadow-[0_0_30px_rgba(0,242,234,0.5)] transition-all transform active:scale-95"
                        isLoading={loading}
                    >
                        Đăng Nhập <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-sm opacity-70" />
                    </Button>

                    <div className="text-center text-sm pt-4 border-t border-white/5">
                        <span className="text-gray-500">Chưa có tài khoản? </span>
                        <Link href="/register" className="text-tik-cyan hover:text-white transition-colors font-bold ml-1">
                            Đăng ký ngay
                        </Link>
                    </div>
                </form>
            </div>

            <div className="absolute bottom-6 text-center w-full z-10 text-xs text-gray-600">
                © 2026 Badminton Calendar. All rights reserved.
            </div>
        </div>
    );
}
