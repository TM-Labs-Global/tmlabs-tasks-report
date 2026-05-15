import type { Metadata } from "next";
import "./globals.css";
import { ClickUpProvider } from "@/shared/context/ClickUpContext";
import { FilterProvider } from "@/shared/context/FilterContext";
import { LayoutWrapper } from "@/shared/components/layout/LayoutWrapper";

export const metadata: Metadata = {
  title: "TM Labs Product Operations Dashboard",
  description: "Executive-level product operations dashboard for TM Labs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans bg-background text-foreground selection:bg-brand-pink/30 selection:text-brand-pink">
        <ClickUpProvider>
          <FilterProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </FilterProvider>
        </ClickUpProvider>
      </body>
    </html>
  );
}
