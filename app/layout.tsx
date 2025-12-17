import "./globals.css";
import PlayerBar from "@/components/PlayerBar";
import Navbar from "@/components/Navbar";
import AppShell from "@/components/AppShell";
import Providers from "@/contexts/providers";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] text-white">
        <Providers>
            <Navbar />
            <AppShell>
              <div className="pb-24">{children}</div>
            </AppShell>
            <PlayerBar />
        </Providers>
      </body>
    </html>
  );
}
