import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET() {
  const categories = await prismadb.category.findMany({
    include: {
      subcategories: true,
      brands: true,
    },
  });
  return NextResponse.json(categories);
}
