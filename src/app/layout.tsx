import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";

export const metadata: Metadata = {
  title: "TeamUp — Événements d'équipe",
  description: "Organisez vos événements d'équipe et gérez les présences en un coup d'œil.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
