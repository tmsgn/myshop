import { ProductForm } from "./components/product-form";
import prismadb from "@/lib/prismadb";

export default async function ProductPage({
  params,
}: {
  params: { storeid: string; productid: string };
}) {
  // Use cache for product and catalog lookups
  const { cacheFetch } = await import("@/lib/cacheMany");
  const product =
    params.productid && params.productid !== "new"
      ? await cacheFetch(
          `product-${params.productid}`,
          () =>
            prismadb.product.findUnique({
              where: {
                id: params.productid,
              },
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                subcategoryId: true,
                brandId: true,
                isFeatured: true,
                status: true,
                images: true,
                discountType: true,
                discountValue: true,
                options: {
                  include: {
                    Option: true,
                  },
                },
                variants: {
                  include: {
                    optionValues: {
                      include: {
                        optionValue: true,
                      },
                    },
                  },
                },
              },
            }),
          60
        )
      : null;

  const [categories, brands, subcategories, options, optionValues] =
    await Promise.all([
      cacheFetch("categories", () => prismadb.category.findMany(), 60),
      cacheFetch(
        "brands",
        () =>
          prismadb.brand.findMany({
            include: {
              categories: {
                select: { id: true },
              },
            },
          }),
        60
      ),
      cacheFetch("subcategories", () => prismadb.subcategory.findMany(), 60),
      cacheFetch("options", () => prismadb.option.findMany(), 60),
      cacheFetch("optionValues", () => prismadb.optionValue.findMany(), 60),
    ]);

  const catalog = {
    categories,
    brands,
    subcategories,
    options,
    optionValues,
  };

  let formattedInitialData = null;

  if (product) {
    const subcategory = subcategories.find(
      (s) => s.id === product.subcategoryId
    );
    formattedInitialData = {
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      images: product.images?.map((img) => ({ url: img.url })) || [],
      categoryId: subcategory ? subcategory.categoryId : "",
      subcategoryId:
        typeof product.subcategoryId === "string" ? product.subcategoryId : "",
      brandId: typeof product.brandId === "string" ? product.brandId : "",
      isFeatured: !!product.isFeatured,
      status: (typeof product.status === "string"
        ? product.status
        : "DRAFT") as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      options: product.options?.map((po) => po.optionId) || [],
      variants:
        product.variants?.map((variant) => {
          const optionValueMap =
            variant.optionValues?.reduce((acc, variantOption) => {
              acc[variantOption.optionValue.optionId] =
                variantOption.optionValueId;
              return acc;
            }, {} as Record<string, string>) || {};
          return {
            id: variant.id,
            price: variant.price,
            stock: variant.stock,
            sku: variant.sku,
            ...optionValueMap,
          };
        }) || [],
      discountType: product.discountType ?? null,
      discountValue: product.discountValue ?? null,
    };
  }

  return (
    <div className="flex-col">
      <div className="flex-1">
        <ProductForm
          catalog={catalog}
          initialData={formattedInitialData}
          storeId={params.storeid}
          productId={params.productid !== "new" ? params.productid : undefined}
        />
      </div>
    </div>
  );
}
