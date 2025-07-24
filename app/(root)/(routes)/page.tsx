import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RootPageClient from "./page-client";

const RootPage = async () => {
  const { userId } = await auth();
  // Use cache for store lookup
  const { cacheFetch } = await import("@/lib/cache");
  const store = await cacheFetch(
    `store-${userId}`,
    () =>
      prismadb.store.findFirst({
        where: {
          userId: userId || undefined,
        },
      }),
    60 // cache for 60 seconds
  );

  if (store) {
    redirect(`/${store.id}/dashboard`);
  }

  return <RootPageClient />;
};

export default RootPage;
