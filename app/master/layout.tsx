import { SuperadminNavbar } from "@/components/navbar/superadmin-navbar";

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      <SuperadminNavbar />
      {/* Semua page di dalam folder /master akan di-render di dalam tag children ini */}
      <div className="animate-in fade-in zoom-in-95 duration-500">
        {children}
      </div>
    </div>
  );
}
