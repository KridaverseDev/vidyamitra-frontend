import { Sidebar } from "./Sidebar";
import { UserNav } from "./UserNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main content area - responsive padding */}
      <div className="lg:pl-64 pl-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 sm:px-6">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h1>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{description}</p>
            )}
          </div>
          <UserNav />
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
