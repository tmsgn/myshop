import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  req: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const body = await req.json();
    const { name, address } = body;
    const { userId } = await auth();
    const storeId = params.storeid;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const store = await prismadb.store.update({
      where: {
        id: storeId,
        userId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json({ id: store.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update store" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    const { userId } = await auth();
    const storeId = params.storeid;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const store = await prismadb.store.delete({
      where: {
        id: storeId,
        userId,
      },
    });

    return NextResponse.json({ id: store.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete store" },
      { status: 500 }
    );
  }
}
