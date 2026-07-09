import type { Metadata } from "next";
import "./globals.css";
import { ClickUpProvider } from "@/shared/context/ClickUpContext";
import { FilterProvider } from "@/shared/context/FilterContext";
import { AuthProvider } from "@/shared/context/AuthContext";
import { WorkspaceProvider } from "@/shared/context/WorkspaceContext";
import { LayoutWrapper } from "@/shared/components/layout/LayoutWrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body className="antialiased font-sans bg-background text-foreground selection:bg-brand-pink/30 selection:text-brand-pink">
        <AuthProvider>
          <WorkspaceProvider>
            <ClickUpProvider>
              <FilterProvider>
                <TooltipProvider delayDuration={300}>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                </TooltipProvider>
              </FilterProvider>
            </ClickUpProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
