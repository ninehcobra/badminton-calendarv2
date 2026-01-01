export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-4xl font-bold text-tik-cyan mb-4 drop-shadow-[0_0_10px_rgba(0,242,234,0.8)]">
        Badminton Calendar
      </h1>
      <p className="text-xl text-tik-red font-semibold drop-shadow-[0_0_10px_rgba(255,0,80,0.8)]">
        Coming Soon...
      </p>
      <div className="flex gap-4 mt-8">
        <a href="/login" className="px-6 py-2 rounded-full border border-tik-cyan text-tik-cyan hover:bg-tik-cyan/20 transition-all">
          Login
        </a>
        <a href="/register" className="px-6 py-2 rounded-full border border-tik-red text-tik-red hover:bg-tik-red/20 transition-all">
          Register
        </a>
      </div>
      <div className="mt-6">
        <a href="/dashboard" className="text-gray-400 hover:text-white underline text-sm">
          Go to Dashboard (Protected)
        </a>
      </div>
    </div>
  );
}
