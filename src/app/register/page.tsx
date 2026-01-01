'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/presentation/hooks/redux';
import { registerUser, checkSession } from '@/presentation/store/slices/authSlice';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import Link from 'next/link';

import { toast } from 'react-hot-toast';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
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
        const result = await dispatch(registerUser({ email, password, fullName }));
        if (registerUser.fulfilled.match(result)) {
            if (!result.payload.session) {
                // Registration successful but no session -> Email confirmation needed
                toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.', {
                    duration: 5000,
                    style: {
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #00f2ea',
                    }
                });
                router.push('/login');
            } else {
                toast.success('Đăng ký thành công!');
            }
        } else if (registerUser.rejected.match(result)) {
            toast.error(result.payload as string || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#1a1a1a] p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-[#333]">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        Tạo tài khoản mới
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Tham gia cộng đồng cầu lông ngay hôm nay
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            label="Họ và Tên"
                            placeholder="Nguyễn Văn A"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
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
                            autoComplete="new-password"
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
                        className="w-full bg-tik-red hover:bg-[#ff1a66] focus:ring-tik-red shadow-[0_0_15px_rgba(255,0,80,0.4)]"
                        isLoading={loading}
                    >
                        Đăng Ký
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-gray-400">Đã có tài khoản? </span>
                        <Link href="/login" className="text-tik-cyan hover:underline font-semibold">
                            Đăng nhập
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
