import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppSidebar } from "@/components/app-sidebar";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import prismadb from "@/lib/prismadb";
import { ThemeProvider } from "@/providers/theme-provider";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { storeid: string };
}

export default async function DashboardLayout({
  children,
  params: { storeid },
}: DashboardLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  // Use cache for store lookup
  const { cacheFetch } = await import("@/lib/cache");
  const store = await cacheFetch(
    `store-${userId}-${storeid}`,
    () =>
      prismadb.store.findFirst({
        where: {
          userId: userId,
          id: storeid,
        },
      }),
    60 
  );

  if (!store) {
    redirect("/sign-in");
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar storeid={storeid} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <DynamicBreadcrumb />
              <div className="flex-1" />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto md:px-4 p-1 pt-2">
            <Separator className="mb-4" />
            <div className="p-1">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
