import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { storeid: string; productid: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    const body = await req.json();
    const {
      name,
      description,
      price,
      categoryId,
      subcategoryId,
      brandId,
      isFeatured,
      status = "DRAFT",
      options = [],
      variants = [],
      images = [],
    } = body;

    // Validate store ownership
    const store = await prismadb.store.findFirst({
      where: { id: params.storeid, userId },
    });
    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Validate product exists
    const product = await prismadb.product.findUnique({
      where: { id: params.productid, storeId: params.storeid },
    });
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Update product
    await prismadb.product.update({
      where: { id: params.productid },
      data: {
        name,
        description,
        price,
        subcategoryId,
        brandId,
        isFeatured: !!isFeatured,
        status:
          status === "PUBLISHED"
            ? "PUBLISHED"
            : status === "ARCHIVED"
            ? "ARCHIVED"
            : "DRAFT",
      },
    });

    // Update images
    if (images && Array.isArray(images)) {
      await prismadb.image.deleteMany({
        where: { productId: params.productid },
      });
      await prismadb.image.createMany({
        data: images.map((image: { url: string }) => ({
          productId: params.productid,
          url: image.url,
        })),
      });
    }

    // Update product options
    if (options && Array.isArray(options)) {
      await prismadb.productOption.deleteMany({
        where: { productId: params.productid },
      });
      await prismadb.productOption.createMany({
        data: options.map((optionId: string) => ({
          productId: params.productid,
          optionId,
        })),
      });
    }

    // Update variants
    if (variants && Array.isArray(variants)) {
      await prismadb.variant.deleteMany({
        where: { productId: params.productid },
      });
      for (const variant of variants) {
        const {
          price,
          stock,
          sku,
          images: variantImages,
          ...variantOptions
        } = variant;
        const createdVariant = await prismadb.variant.create({
          data: {
            price,
            stock: stock || 0,
            sku: sku || undefined,
            productId: params.productid,
            images: {
              createMany: {
                data:
                  variantImages?.map((image: { url: string }) => ({
                    url: image.url,
                  })) || [],
              },
            },
          },
        });
        for (const [optionId, optionValueId] of Object.entries(
          variantOptions
        )) {
          // Validate optionValueId exists and belongs to optionId
          const validOptionValue = await prismadb.optionValue.findFirst({
            where: {
              id: optionValueId as string,
              optionId: optionId,
            },
          });
          if (!validOptionValue) {
            console.warn(
              `[PATCH] Skipping invalid optionValueId: ${optionValueId} for optionId: ${optionId}`
            );
            continue;
          }
          await prismadb.variantOption.create({
            data: {
              variantId: createdVariant.id,
              optionValueId: optionValueId as string,
            },
          });
        }
      }
    }

    return new NextResponse("Product updated", { status: 200 });
  } catch (error: any) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse(error?.message || "Internal server error", {
      status: 500,
    });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeid: string; productid: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    // Validate store ownership
    const store = await prismadb.store.findFirst({
      where: { id: params.storeid, userId },
    });
    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Validate product exists
    const product = await prismadb.product.findUnique({
      where: { id: params.productid, storeId: params.storeid },
    });
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Delete related data (images, options, variants, etc)
    await prismadb.image.deleteMany({ where: { productId: params.productid } });
    await prismadb.productOption.deleteMany({
      where: { productId: params.productid },
    });
    const variants = await prismadb.variant.findMany({
      where: { productId: params.productid },
    });
    for (const variant of variants) {
      await prismadb.variantOption.deleteMany({
        where: { variantId: variant.id },
      });
      await prismadb.image.deleteMany({ where: { variantId: variant.id } });
    }
    await prismadb.variant.deleteMany({
      where: { productId: params.productid },
    });

    // Delete the product itself
    await prismadb.product.delete({ where: { id: params.productid } });

    return new NextResponse("Product deleted", { status: 200 });
  } catch (error: any) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse(error?.message || "Internal server error", {
      status: 500,
    });
  }
}
