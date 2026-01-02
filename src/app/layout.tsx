import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "@/presentation/providers";
import { Toaster } from "react-hot-toast";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["vietnamese"],
  variable: "--font-be-vietnam-pro",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Badminton Calendar",
  description: "Manage your badminton schedule efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${beVietnamPro.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="top-center" reverseOrder={false} />
        </Providers>
      </body>
    </html>
  );
}
