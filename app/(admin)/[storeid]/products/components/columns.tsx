"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { AlertModal } from "@/components/modals/alert-modal";

export type Product = {
  id: string;
  name: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  brand: { name: string };
  subcategory: { name: string };
  _count: { variants: number };
  stock: number;
  variants: { stock: number }[];
  storeId: string;
};

function CellAction({ product }: { product: Product }) {
  const router = useRouter();
  const params = useParams();

  const onCopy = async (id: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(id);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = id;
      
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success("Product ID copied to clipboard.");
    } catch {
      toast.error("Failed to copy product ID.");
    }
  };

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/${params.storeid}/products/${product.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Product deleted successfully.");
        router.refresh?.();
      } else {
        toast.error("Failed to delete product.");
      }
    } catch (err) {
      toast.error("An error occurred while deleting.");
    }
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCopy(product.id);
            }}
          >
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/${params.storeid}/products/${product.id}`);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <div
              className="text-destructive w-full text-left px-2 py-1.5 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }}
            >
              Delete
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertModal
        open={open}
        loading={loading}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          if (!loading) setOpen(false);
        }}
      />
    </>
  );
}

const statusVariantMap: {
  [key in Product["status"]]: "outline" | "secondary" | "default";
} = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Product["status"];
      return <Badge variant={statusVariantMap[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => row.original.brand.name,
  },
  {
    accessorKey: "subcategory",
    header: "Subcategory",
    cell: ({ row }) => row.original.subcategory.name,
  },
  {
    id: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.original.stock;
      return (
        <div className="text-center flex items-center justify-center gap-2">
          {stock}
          {stock <= 5 && <Badge variant="destructive">Low</Badge>}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date Added
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString();
      return <div>{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction product={row.original} />,
  },
];
