import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { NavUser } from "./nav-user";
export async function AppSidebar({
  storeid,
  ...props
}: React.ComponentProps<typeof Sidebar> & { storeid: string }) {
  const user = await currentUser();
  const stores = await prismadb.store.findMany({
    where: {
      userId: user?.id ?? "",
    },
  });

  // Fetch categories for the current store
  const data = {
    user: {
      name: user?.firstName
        ? `${user.firstName} ${user.lastName ?? ""}`
        : "User",
      email: user?.emailAddresses?.[0]?.emailAddress ?? "",
      avatar: user?.imageUrl ?? "/avatars/shadcn.jpg",
    },
    stores: [
      ...stores.map((store: { name: string; id: string; }) => ({
        name: store.name,
        id: store.id,
      })),
    ],
    navMain: [
      {
        title: "Dashboard",
        url: `/${storeid}/dashboard`,
        icon: "home",
      },
      {
        title: "Products",
        url: `/${storeid}/products`,
        icon: "shirt",
      },
      {
        title: "Orders",
        url: `/${storeid}/orders`,
        icon: "book-open",
      },
      {
        title: "Settings",
        url: `/${storeid}/settings`,
        icon: "settings",
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher stores={data.stores} storeid={storeid} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
