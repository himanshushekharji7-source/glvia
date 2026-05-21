import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface flex flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
