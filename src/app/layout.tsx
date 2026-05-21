import type { Metadata } from "next";
import { Jost, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: "ChessOnline - Play Premium Chess",
  description:
    "Experience the next generation of online chess with real-time gameplay, AI analysis, matchmaking, puzzles, and a stunning interface.",
  openGraph: {
    title: "ChessOnline",
    description: "Play chess online with real-time matchmaking & AI analysis.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${montserrat.variable} dark antialiased h-full overflow-hidden`}
      suppressHydrationWarning
    >
        <body className="h-full flex flex-col lg:flex-row font-montserrat selection:bg-primary/30 transition-colors duration-300 overflow-hidden">
          <ThemeProvider>
            <AuthProvider>
              <Navbar />
              <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative transition-colors duration-300">
                {children}
              </main>
            </AuthProvider>
          </ThemeProvider>
        </body>
    </html>
  );
}
