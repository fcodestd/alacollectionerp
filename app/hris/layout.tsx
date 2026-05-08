import { NavbarHris } from "@/components/navbar/hris-navbar";

export default function HrisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // pb-16 memastikan konten di mobile tidak tenggelam di balik Bottom Tab Bar
    <div className="min-h-screen bg-muted/10 pb-16 md:pb-0">
      <NavbarHris />
      <div className="animate-in fade-in zoom-in-95 duration-500">
        {children}
      </div>
    </div>
  );
}
