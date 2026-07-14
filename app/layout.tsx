import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Poppins bukan variable font, jadi weight wajib disebut manual
});

export const metadata: Metadata = {
  title: {
    default: "Pertamina Hulu Rokan Zona 1",
    template: "%s",
  },
  description: "Aplikasi web untuk memvisualisasikan data produksi, fasilitas, dan geografis Pertamina Hulu Rokan Zona 1.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="flex h-full flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
