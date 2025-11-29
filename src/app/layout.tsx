import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { SocketProvider } from "@/context/SocketContext"; // <--- Import
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SocialSphere",
  description: "Connect with the world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <AuthProvider>
          {/* SocketProvider must be INSIDE StoreProvider because it uses useSelector */}
          <SocketProvider>
            <Navbar />
            {children}
          </SocketProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}