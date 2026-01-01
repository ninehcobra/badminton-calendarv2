'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/presentation/hooks/redux';
import { loginUser, checkSession } from '@/presentation/store/slices/authSlice';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import Link from 'next/link';

import { toast } from 'react-hot-toast';

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
            toast.success('Đăng nhập thành công!', {
                style: {
                    background: '#333',
                    color: '#fff',
                    border: '1px solid #00f2ea',
                }
            });
        } else if (loginUser.rejected.match(result)) {
            toast.error(result.payload as string || 'Đăng nhập thất bại');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#1a1a1a] p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-[#333]">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Chào mừng trở lại!
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Đăng nhập để quản lý lịch cầu lông của bạn
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
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
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/20 border border-tik-red rounded text-tik-red text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={loading}
                    >
                        Đăng Nhập
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-gray-400">Chưa có tài khoản? </span>
                        <Link href="/register" className="text-tik-cyan hover:underline font-semibold">
                            Đăng ký ngay
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
