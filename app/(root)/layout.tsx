import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  // Use cache for store lookup
  const { cacheFetch } = await import("@/lib/cache");
  const store = await cacheFetch(
    `store-${userId}`,
    () =>
      prismadb.store.findFirst({
        where: {
          userId: userId || "",
        },
      }),
    60 // cache for 60 seconds
  );

  if (!userId) {
    redirect("/sign-in");
  }

  if (store) {
    redirect(`/${store.id}/dashboard`);
  }

  return <div className="bg-secondary">{children}</div>;
}
