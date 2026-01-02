'use client';

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faChartLine, faUsers, faArrowRight, faGamepad, faBolt, faCheckCircle, faUserPlus, faPenNib } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-tik-cyan selection:text-black">

      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_100%)]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tik-cyan/20 to-blue-600/20 flex items-center justify-center border border-white/5 p-2 group-hover:border-tik-cyan/50 transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bc-logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-wider text-white">BADMINTON<span className="text-tik-cyan">CALENDAR</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Đăng Nhập
          </Link>
          <Link href="/register" className="group px-6 py-2 rounded-full bg-tik-cyan/10 border border-tik-cyan/50 text-tik-cyan text-sm font-bold hover:bg-tik-cyan hover:text-black transition-all shadow-[0_0_15px_rgba(0,242,234,0.3)] hover:shadow-[0_0_25px_rgba(0,242,234,0.6)]">
            Đăng Ký Ngay <FontAwesomeIcon icon={faArrowRight} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-tik-red animate-pulse" />
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-300">Mùa Giải 2026 Đang Diễn Ra</span>
        </div>

        <h1 className="max-w-5xl text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 mb-8 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 uppercase tracking-tighter leading-tight">
          Nâng Tầm <br /> <span className="text-tik-cyan drop-shadow-[0_0_30px_rgba(0,242,234,0.5)]">Đam Mê Cầu Lông</span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Nền tảng tối ưu dành cho cộng đồng cầu lông. Theo dõi lịch sử trận đấu, phân tích điểm rank ELO chuẩn xác và leo hạng trên bảng xếp hạng danh giá.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Link href="/dashboard" className="px-10 py-4 rounded-xl bg-gradient-to-r from-tik-cyan to-blue-600 text-black font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,242,234,0.4)] hover:shadow-[0_0_50px_rgba(0,242,234,0.6)]">
            BẮT ĐẦU NGAY
          </Link>
          <Link href="/leaderboard" className="px-10 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-white font-bold text-lg hover:bg-white/10 hover:border-white/30 transition-all">
            XEM BẢNG XẾP HẠNG
          </Link>
        </div>
      </main>

      {/* Stats Section */}
      <section className="relative z-20 py-12 border-y border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">1,000+</div>
            <div className="text-gray-500 text-sm uppercase tracking-wider font-bold">Trận Đấu</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-tik-cyan mb-2">500+</div>
            <div className="text-gray-500 text-sm uppercase tracking-wider font-bold">Vợt Thủ</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">10+</div>
            <div className="text-gray-500 text-sm uppercase tracking-wider font-bold">Câu Lạc Bộ</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-tik-red mb-2">24/7</div>
            <div className="text-gray-500 text-sm uppercase tracking-wider font-bold">Hệ Thống Online</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Tính Năng Định Đỉnh Cao</h2>
            <div className="w-24 h-1 bg-tik-cyan mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="group p-10 rounded-[2rem] bg-[#0a0a0a] border border-[#222] hover:border-tik-cyan/50 transition-colors duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <FontAwesomeIcon icon={faTrophy} className="text-9xl text-white" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mb-8 shadow-lg shadow-orange-500/20">
                <FontAwesomeIcon icon={faTrophy} className="text-white text-3xl" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Xếp Hạng ELO Uy Tín</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Hệ thống tính điểm ELO chuẩn quốc tế. Leo hạng từ Sắt, Đồng, Bạc đến Thách Đấu. Khẳng định vị thế của bạn trên sân cầu.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-10 rounded-[2rem] bg-[#0a0a0a] border border-[#222] hover:border-tik-red/50 transition-colors duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <FontAwesomeIcon icon={faChartLine} className="text-9xl text-white" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mb-8 shadow-lg shadow-red-500/20">
                <FontAwesomeIcon icon={faChartLine} className="text-white text-3xl" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Phân Tích Chuyên Sâu</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Lưu trữ chi tiết từng trận đấu, tỉ số set, và lịch sử đối đầu. Theo dõi biểu đồ phong độ để cải thiện kỹ năng mỗi ngày.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-10 rounded-[2rem] bg-[#0a0a0a] border border-[#222] hover:border-purple-500/50 transition-colors duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <FontAwesomeIcon icon={faGamepad} className="text-9xl text-white" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/20">
                <FontAwesomeIcon icon={faGamepad} className="text-white text-3xl" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Giải Đấu Chuyên Nghiệp</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Tổ chức và quản lý giải đấu dễ dàng. Tạo bảng đấu, xếp lịch và cập nhật kết quả realtime (Tính năng sắp ra mắt).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 bg-[#020202] relative border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 space-y-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Đơn Giản & Hiệu Quả</h2>
                <p className="text-xl text-gray-400">Quy trình ghi nhận kết quả chỉ trong vài bước đơn giản.</p>
              </div>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-tik-cyan/30 bg-tik-cyan/5 text-tik-cyan flex items-center justify-center font-bold text-xl">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Tạo Tài Khoản</h4>
                    <p className="text-gray-500">Đăng ký nhanh chóng và cập nhật hồ sơ cá nhân của bạn.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-tik-cyan/30 bg-tik-cyan/5 text-tik-cyan flex items-center justify-center font-bold text-xl">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Tham Gia Trận Đấu</h4>
                    <p className="text-gray-500">Thi đấu giao hữu hoặc xếp hạng tại sân cầu lông yêu thích.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-tik-cyan/30 bg-tik-cyan/5 text-tik-cyan flex items-center justify-center font-bold text-xl">3</div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Nhập Kết Quả & Nhận Điểm</h4>
                    <p className="text-gray-500">Người chiến thắng cập nhật tỉ số. Hệ thống tự động tính toán ELO.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual/Image Placeholder */}
            <div className="flex-1 w-full relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-tik-cyan to-blue-600 rounded-[2.5rem] blur-2xl opacity-20"></div>
              <div className="relative bg-[#0a0a0a] border border-[#222] rounded-[2rem] p-8 md:p-12 shadow-2xl">
                <div className="space-y-6">
                  {/* Mock Match Card */}
                  <div className="bg-[#151515] rounded-xl p-4 border border-[#333] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                      <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="text-tik-cyan font-bold">WIN +25 ELO</div>
                  </div>
                  <div className="bg-[#151515] rounded-xl p-4 border border-[#333] flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                      <div className="w-24 h-4 bg-gray-700 rounded"></div>
                    </div>
                    <div className="text-gray-500 font-bold">LOSE -12 ELO</div>
                  </div>
                </div>
                <div className="mt-8 text-center text-sm text-gray-500 font-mono">
                  Hệ thống cập nhật real-time
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#111] bg-[#020202] text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="mb-8 flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-tik-cyan to-blue-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faBolt} className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white">BADMINTON<span className="text-tik-cyan">CALENDAR</span></span>
          </div>
          <p className="text-gray-500 text-sm mb-2">Designed for Champions.</p>
          <p className="text-gray-600 text-sm">© 2026 Badminton Calendar. Bản quyền thuộc về Trương Nguyễn Công Chính.</p>
        </div>
      </footer>

    </div>
  );
}
