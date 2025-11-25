import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/AuthContext"; // Import AuthProvider

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["700"], 
  variable: "--font-poppins" 
});

export const metadata: Metadata = {
  title: "Zaplaza App",
  description: "Seu condomínio, mais conectado do que nunca.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable}`}>
        <AuthProvider> {/* Wrap the application with AuthProvider */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
