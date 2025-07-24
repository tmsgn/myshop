"use client";
import * as React from "react";
import { ChevronsUpDown, Plus, StoreIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { StoreModal } from "./modals/store-modal";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export function TeamSwitcher({
  stores,
  storeid,
}: {
  stores: {
    name: string;
    id: string;
  }[];
  storeid: string;
}) {
  const { isMobile } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const activeStore = useMemo(
    () => stores.find((store) => store.id === storeid) || stores[0],
    [stores, storeid]
  );

  if (!activeStore) {
    return null;
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <StoreIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeStore.name}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Stores
              </DropdownMenuLabel>
              {stores.map((store) => {
                const isActive = store.id === activeStore.id;

                return (
                  <DropdownMenuItem
                    key={store.id}
                    onClick={() => {
                      router.push(`/${store.id}`);
                    }}
                    className={cn(
                      "gap-2 p-2",
                      isActive && "bg-muted font-semibold text-primary"
                    )}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <StoreIcon className="size-4" />
                    </div>
                    <div className="truncate font-medium flex flex-col gap-0.5">
                      {store.name}
                    </div>
                  </DropdownMenuItem>
                );
              })}

              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div
                  onClick={() => {
                    setIsOpen(true);
                  }}
                  className="text-muted-foreground font-medium"
                >
                  Add store
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <StoreModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />
    </>
  );
}
