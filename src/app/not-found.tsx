'use client'

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] text-white px-4 py-20 relative overflow-hidden font-sans selection:bg-tik-red selection:text-white">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 blur-sm scale-110"
                    style={{ backgroundImage: "url('/hero-bg.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#050505]" />
            </div>

            <div className="relative z-10 text-center animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto flex flex-col items-center">
                {/* Logo with Glow */}
                <div className="mb-6 inline-block animate-bounce duration-[3000ms]">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tik-cyan/20 to-tik-red/20 border border-white/5 flex items-center justify-center p-4 shadow-[0_0_30px_rgba(0,242,234,0.15)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/bc-logo.png" alt="BC Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,242,234,0.5)]" />
                    </div>
                </div>

                <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 drop-shadow-2xl mb-4 leading-none">
                    404
                </h1>

                <div className="w-16 h-1 bg-gradient-to-r from-tik-cyan to-tik-red mx-auto rounded-full mb-8" />

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Oops! Không Tìm Thấy Trang
                </h2>

                <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed px-4">
                    Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-tik-cyan to-blue-600 text-black font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,234,0.3)] hover:shadow-[0_0_40px_rgba(0,242,234,0.5)]"
                >
                    <FontAwesomeIcon icon={faHome} className="text-black" />
                    Quay Về Trang Chủ
                </Link>
            </div>

            <div className="mt-12 text-center w-full z-10 text-[10px] text-gray-700 font-mono">
                CODE: SEARCH_FAILED | SYSTEM: BADMINTON_CALENDAR
            </div>
        </div>
    );
}
