import "./globals.css";
import PlayerBar from "@/components/PlayerBar";
import Navbar from "@/components/Navbar";
import { PlayerProvider } from "@/contexts/PlayerContext";
import AppShell from "@/components/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] text-white">
        <PlayerProvider>
          <Navbar />
          <AppShell>
            <div className="pb-24">{children}</div>
          </AppShell>
          <PlayerBar />
        </PlayerProvider>
      </body>
    </html>
  );
}
