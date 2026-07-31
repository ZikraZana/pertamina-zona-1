import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import { PageTransitionProvider } from "@/components/Navbar/PageTransition";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Pertamina Hulu Rokan Zona 1",
    template: "%s",
  },
  description: "Aplikasi web untuk memvisualisasikan data produksi, fasilitas, dan geografis Pertamina Hulu Rokan Zona 1.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <body>
                <PageTransitionProvider>
                    <Navbar />
                    {children}
                </PageTransitionProvider>
            </body>
        </html>
    );
}