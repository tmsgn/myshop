"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Product, columns } from "./columns";
import { DataTable } from "./data-table";

interface ProductsClientProps {
  data: Product[];
}

export const ProductsClient: React.FC<ProductsClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading
          title={`Products (${data.length})`}
          description="Manage products for your store"
          
        />
        <Button
          className="w-full sm:w-auto"
          onClick={() => router.push(`/${params.storeid}/products/new`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <div className="overflow-x-auto">
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
};
