import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { storeid: string } }
) {
  try {
    if (!params.storeid) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: { storeId: params.storeid },
      include: {
        images: true,
        Brand: true,
        Subcategory: true,
        variants: {
          include: {
            images: true,
            optionValues: true,
          },
        },
        options: true,
      },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("[PRODUCTS_GET]", error);
    return new NextResponse(error?.message || "Internal server error", {
      status: 500,
    });
  }
}
// Continue in the same file...

export async function POST(
  req: Request,
  { params }: { params: { storeid: string } }
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
      discountType = null,
      discountValue = null,
    } = body;

    // Validation
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!description)
      return new NextResponse("Description is required", { status: 400 });
    if (!price || isNaN(price))
      return new NextResponse("Valid price is required", { status: 400 });
    if (!categoryId)
      return new NextResponse("Category is required", { status: 400 });
    if (!subcategoryId)
      return new NextResponse("Subcategory is required", { status: 400 });
    if (!brandId) return new NextResponse("Brand is required", { status: 400 });
    if (!images.length)
      return new NextResponse("At least one image is required", {
        status: 400,
      });
    if (!variants.length)
      return new NextResponse("At least one variant is required", {
        status: 400,
      });
    if (!params.storeid)
      return new NextResponse("Store ID is required", { status: 400 });

    // Verify store ownership
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: params.storeid, userId },
    });
    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 403 });

    const allVariantOptionKeys: string[] = Array.from(
      new Set(
        variants.flatMap((variant: any) =>
          Object.keys(variant).filter(
            (key) =>
              !["price", "stock", "sku", "images", "productId"].includes(key)
          )
        )
      )
    );
    const validOptions = await prismadb.option.findMany({
      where: {
        id: { in: allVariantOptionKeys },
        subcategoryId,
      },
    });
    if (validOptions.length !== allVariantOptionKeys.length) {
      return new NextResponse("Invalid product options", { status: 400 });
    }

    // Create product with variants in a transaction
    const product = await prismadb.$transaction(async (prisma) => {
      // 1. Create the base product
      const product = await prisma.product.create({
        data: {
          name,
          description,
          price,
          isFeatured: !!isFeatured,
          storeId: params.storeid,
          brandId,
          subcategoryId,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          status:
            status === "PUBLISHED"
              ? "PUBLISHED"
              : status === "ARCHIVED"
              ? "ARCHIVED"
              : "DRAFT",
          images: {
            createMany: {
              data: images.map((image: { url: string }) => ({
                url: image.url,
              })),
            },
          },
          discountType: discountType || null,
          discountValue: discountValue !== null ? Number(discountValue) : null,
        },
      });

      if (!product || !product.id) {
        throw new Error("Product creation failed: No product ID returned.");
      }
      console.log("[DEBUG] Created product:", product);

      // 2. Link product to all used options
      if (allVariantOptionKeys.length > 0) {
        await prisma.productOption.createMany({
          data: allVariantOptionKeys.map((optionId: string) => ({
            productId: product.id,
            optionId,
          })),
        });
      }

      // 3. Create variants with their option values
      for (const variant of variants) {
        // Print the full variant object for debugging
        console.log("[DEBUG] Raw variant object received:", variant);
        // Remove any productId accidentally sent from frontend
        const {
          price,
          stock,
          sku,
          productId: _ignoreProductId,
          images,
          ...variantOptions
        } = variant;

        // Only validate that all option keys in this variant are valid
        const variantOptionKeys = Object.keys(variantOptions);
        const validVariantOptionKeys = validOptions.map((opt) => opt.id);
        if (
          !variantOptionKeys.every((key) =>
            validVariantOptionKeys.includes(key)
          )
        ) {
          throw new Error("Variant contains invalid option key");
        }

        // Debug log
        console.log("[DEBUG] Creating variant with:", {
          price,
          stock,
          sku,
          productId: product.id,
          variantOptions,
        });

        // Extra check for product.id
        if (!product.id) {
          throw new Error("[FATAL] product.id is missing at variant creation!");
        }

        // Create the variant
        const createdVariant = await prisma.variant.create({
          data: {
            price,
            stock: stock || 0,
            sku: sku || undefined,
            productId: product.id,
            images: {
              createMany: {
                data:
                  images?.map((image: { url: string }) => ({
                    url: image.url,
                  })) || [],
              },
            },
          },
        });

        // Link variant to option values
        for (const [optionId, optionValueId] of Object.entries(
          variantOptions
        )) {
          await prisma.variantOption.create({
            data: {
              variantId: createdVariant.id,
              optionValueId: optionValueId as string,
            },
          });
        }
      }

      return product;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse(error?.message || "Internal server error", {
      status: 500,
    });
  }
}
