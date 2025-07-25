import { NextResponse } from "next/server";
import { getDashboardData } from "@/app/(admin)/[storeid]/dashboard/data";

export async function GET(
  req: Request,
  { params }: { params: { storeid: string } }
) {
  const { storeid } = params;
  try {
    const data = await getDashboardData(storeid);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
