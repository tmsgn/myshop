"use client";
import React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Home page is /storeid
  const storeid = segments[0];
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/${storeid}/dashboard`}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.slice(1).map((segment, idx) => (
          <React.Fragment key={segment}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {idx === segments.slice(1).length - 1 ? (
                <BreadcrumbPage>
                  {decodeURIComponent(segment.replace(/-/g, " "))}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={`/${[storeid, ...segments.slice(1, idx + 2)].join(
                    "/"
                  )}`}
                >
                  {decodeURIComponent(segment.replace(/-/g, " "))}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
