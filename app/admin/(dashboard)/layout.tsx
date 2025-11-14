import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AdminClientWrapper } from "./ClientWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect to admin login if not authenticated
  if (!session) {
    redirect("/admin/login");
  }

  // Redirect to admin login if not an admin
  if (session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <AdminClientWrapper>
      <AdminHeader user={session.user} />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 px-4 py-4 sm:py-6 lg:py-8 relative z-10">
          <div className="max-w-[80%] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
      <ScrollToTop />
    </AdminClientWrapper>
  );
}
