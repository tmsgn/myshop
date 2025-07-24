import { ProductsClient } from "./components/product-client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ProductsPage = async ({ params }: any) => {
  const products = await prisma.product.findMany({
    where: {
      storeId: params.storeid,
    },
    include: {
      Brand: true,
      Subcategory: true,
      variants: true,
      _count: {
        select: { variants: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts = products.map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status,
    createdAt: new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(item.createdAt),
    brand: item.Brand,
    subcategory: item.Subcategory,
    stock: item.variants.reduce(
      (acc, variant) => acc + (variant.stock || 0),
      0
    ),
    _count: item._count,
    variants: item.variants,
    storeId: item.storeId,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductsClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;
