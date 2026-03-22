import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { DashboardFooter } from "@/components/shared/DashboardFooter";
import { AuthInitializer } from "@/components/shared/auth-initializer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <AuthInitializer />
      <DashboardHeader />
      <main id="main-content" className="flex-1">{children}</main>
      <DashboardFooter />
    </div>
  );
}
