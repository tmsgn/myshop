import prismadb from "@/lib/prismadb";

export async function getDashboardData(storeId: string) {
  // Total Revenue
  const orders = await prismadb.order.findMany({
    where: { storeId },
    select: {
      total: true,
      createdAt: true,
      status: true,
      userId: true,
      id: true,
    },
  });
  const totalRevenue = orders.reduce(
    (sum: number, o: any) => sum + Number(o.total),
    0
  );
  const totalSales = orders.length;
  // New Customers (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newCustomerIds = Array.from(
    new Set(
      orders
        .filter((o: any) => new Date(o.createdAt) >= thirtyDaysAgo)
        .map((o: any) => o.userId)
    )
  );
  const newCustomers = newCustomerIds.length;
  const avgOrderValue = totalSales ? totalRevenue / totalSales : 0;

  // Sales Data (last 7 days)
  const salesData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    const dayOrders = orders.filter(
      (o: any) => o.createdAt.toDateString() === date.toDateString()
    );
    const total = dayOrders.reduce(
      (sum: number, o: any) => sum + Number(o.total),
      0
    );
    return { date: day, total };
  });

  // Category Sales Data
  const categories = await prismadb.category.findMany();
  const categorySalesData = await Promise.all(
    categories.map(async (cat: any) => {
      // Find products in this category and store
      const products = await prismadb.product.findMany({
        where: { storeId, Subcategory: { categoryId: cat.id } },
        select: { id: true, price: true },
      });
      // Sum sales for these products
      const productIds = products.map((p: any) => p.id);
      const orderProducts = await prismadb.orderProduct.findMany({
        where: { productId: { in: productIds } },
        select: { productId: true },
      });
      const sales = orderProducts.length;
      return {
        category: cat.name,
        sales,
        fill: `var(--color-${cat.name.replace(/\s/g, "")})`,
      };
    })
  );

  // Recent Orders
  const recentOrdersRaw = await prismadb.order.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  const recentOrders = recentOrdersRaw.map((order: any) => ({
    id: order.id,
    userId: order.userId,
    total: Number(order.total),
    status: order.status,
    date: order.createdAt.toISOString().slice(0, 10),
  }));

  // Top Products (by number of orders)
  const topProductsRaw = await prismadb.product.findMany({
    where: { storeId },
    select: { id: true, name: true },
  });
  // Count orders for each product
  const productOrderCounts = await Promise.all(
    topProductsRaw.map(async (p: any) => {
      const count = await prismadb.orderProduct.count({
        where: { productId: p.id },
      });
      return { name: p.name, sold: count };
    })
  );
  // Sort and take top 3
  const topProducts = productOrderCounts
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 3);

  return {
    totalRevenue,
    totalSales,
    newCustomers,
    avgOrderValue,
    salesData,
    categorySalesData,
    recentOrders,
    topProducts,
  };
}
