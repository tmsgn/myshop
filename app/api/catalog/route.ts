import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    const brands = await prisma.brand.findMany({
      include: { categories: true },
    });
    const subcategories = await prisma.subcategory.findMany();
    const options = await prisma.option.findMany();
    const optionValues = await prisma.optionValue.findMany();

    return NextResponse.json({
      categories,
      brands,
      subcategories,
      options,
      optionValues,
    });
  } catch (error) {
    console.error("API /api/catalog error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
