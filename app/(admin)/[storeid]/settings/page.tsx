import prismadb from "@/lib/prismadb";
import React from "react";
import { SettingForm } from "./setting-form";

interface SettingPageProps {
  params: { storeid: string };
}

const SettingPage = async ({ params: { storeid } }: SettingPageProps) => {
  // Use cache for store lookup
  const { cacheFetch } = await import("@/lib/cache");
  const store = await cacheFetch(
    `store-${storeid}`,
    () => prismadb.store.findFirst({ where: { id: storeid } }),
    60 // cache for 60 seconds
  );
  return (
    <div>
      <SettingForm
        storeId={storeid}
        initialData={{ name: store?.name ?? "" }}
      />
    </div>
  );
};

export default SettingPage;
