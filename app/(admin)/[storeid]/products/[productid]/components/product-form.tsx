"use client";
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-uploader";
import { Trash2, PlusCircle } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { generateSKU } from "@/lib/utils";

const ProductStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const DiscountTypeEnum = z.enum(["PERCENTAGE", "FIXED"]);

const productFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0.01),
  images: z
    .array(z.object({ url: z.string().url() }))
    .min(1, "At least one image is required"),
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1),
  brandId: z.string().min(1),
  isFeatured: z.boolean(),
  status: ProductStatus,
  options: z.array(z.string()),
  discountType: DiscountTypeEnum.optional().nullable(),
  discountValue: z.number().optional().nullable(),
  variants: z
    .array(
      z
        .object({
          price: z.number().min(0),
          stock: z.number().min(0),
          sku: z.string().optional(),
        })
        .catchall(z.string().or(z.number()).optional())
    )
    .min(1),
});

type CatalogType = {
  categories: any[];
  brands: any[];
  subcategories: any[];
  options: any[];
  optionValues: any[];
};

interface ProductFormProps {
  initialData: z.infer<typeof productFormSchema> | null;
  catalog: CatalogType;
  storeId: string;
  productId?: string;
  onDelete?: () => Promise<void>;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  catalog,
  storeId,
  productId,
  onDelete,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Remove global selectedOptions. Each variant will manage its own option keys.

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      images: [],
      categoryId: "",
      subcategoryId: "",
      brandId: "",
      isFeatured: false,
      status: "DRAFT",
      options: [],
      discountType: null,
      discountValue: null,
      variants: [],
    },
  });

  const {
    fields: variantFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Remove global selectedOptions effect. We'll update options per variant.

  // New: Per-variant option toggle
  const handleVariantOptionToggle = (variantIndex: number, optId: string) => {
    const variants = form.getValues("variants");
    const variant = { ...variants[variantIndex] };
    if (optId in variant) {
      delete variant[optId];
    } else {
      variant[optId] = "";
    }
    const updatedVariants = [...variants];
    updatedVariants[variantIndex] = variant;
    form.setValue("variants", updatedVariants);
  };

  const optionsObj = React.useMemo(
    () => Object.fromEntries(catalog.options.map((opt) => [opt.id, opt])),
    [catalog.options]
  );

  const getSubcategories = () => {
    const categoryId = form.watch("categoryId");
    if (!categoryId) return [];
    return catalog.subcategories.filter((s) => s.categoryId === categoryId);
  };

  const getAvailableOptions = () => {
    const subcategoryId = form.watch("subcategoryId");
    if (!subcategoryId) return [];
    return catalog.options.filter((opt) => opt.subcategoryId === subcategoryId);
  };

  const getAvailableBrands = () => {
    const categoryId = form.watch("categoryId");
    if (!categoryId) return [];
    return catalog.brands.filter((b) =>
      b.categories.some((c: { id: string }) => c.id === categoryId)
    );
  };

  const handleGenerateSku = (variantIndex: number) => {
    const productName = form.getValues("name");
    const categoryId = form.getValues("categoryId");
    const brandId = form.getValues("brandId");
    if (!productName || !categoryId || !brandId) {
      toast.error("Please fill in Product Name, Category, and Brand first.");
      return;
    }
    const categoryName =
      catalog.categories.find((c) => c.id === categoryId)?.name || "";
    const brandName = catalog.brands.find((b) => b.id === brandId)?.name || "";
    const variant = form.getValues(`variants.${variantIndex}`);
    // Only use this variant's option keys
    const optionKeys = Object.keys(variant).filter((key) =>
      catalog.options.some((opt) => opt.id === key)
    );
    const variantValueNames = optionKeys.map((optId) => {
      const valueId = variant[optId];
      return catalog.optionValues.find((ov) => ov.id === valueId)?.value || "";
    });
    const sku = generateSKU(
      productName,
      categoryName,
      brandName,
      variantValueNames
    );
    form.setValue(`variants.${variantIndex}.sku`, sku);
    toast.info(`Generated SKU: ${sku}`);
  };

  const onSubmit = async (data: z.infer<typeof productFormSchema>) => {
    try {
      setLoading(true);
      if (productId) {
        await axios.patch(`/api/${storeId}/products/${productId}`, {
          ...data,
          storeId,
        });
        toast.success("Product updated successfully!");
      } else {
        await axios.post(`/api/${storeId}/products`, { ...data, storeId });
        toast.success("Product created successfully!");
      }
      window.location.href = `/${storeId}/products`;
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {productId ? "Edit Product" : "Create Product"}
            </CardTitle>
            <CardDescription>
              Fill in the product's information, imagery, and categorization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value.map((image) => image.url)}
                      onChange={(url: string) =>
                        field.onChange([...field.value, { url }])
                      }
                      onRemove={(url: string) =>
                        field.onChange(
                          field.value.filter((current) => current.url !== url)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={loading}
                        placeholder="e.g., Premium Cotton T-Shirt"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={loading}
                        placeholder="e.g., 29.99"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                          <SelectItem value="FIXED">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={loading || !form.watch("discountType")}
                        placeholder={
                          form.watch("discountType") === "PERCENTAGE"
                            ? "e.g., 10 for 10%"
                            : "e.g., 5 for $5 off"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={loading}
                      placeholder="Describe your product in detail..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.resetField("subcategoryId");
                        form.resetField("brandId");
                        form.setValue("variants", []);
                      }}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {catalog.categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subcategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("variants", []);
                      }}
                      value={field.value}
                      disabled={!form.watch("categoryId") || loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subcategory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getSubcategories().map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!form.watch("categoryId") || loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableBrands().map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Product</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This product will appear on the homepage.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {form.watch("subcategoryId") && (
          <Card>
            <CardHeader>
              <CardTitle>Product Variants & Inventory</CardTitle>
              <CardDescription>
                Define product variations like color or size. Each unique
                combination will have its own price, stock, and SKU.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Label className="font-semibold">
                Step 1: Add & Configure Variants
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newVariant: any = {
                    price: form.getValues("price") || 0,
                    stock: 0,
                    sku: "",
                  };
                  append(newVariant);
                }}
                disabled={loading}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
              </Button>
              <Separator />
              <div className="space-y-4">
                {variantFields.map((field, index) => {
                  const variant = form.getValues(`variants.${index}`);
                  // Option keys for this variant
                  const optionKeys = Object.keys(variant).filter((key) =>
                    catalog.options.some((opt) => opt.id === key)
                  );
                  return (
                    <div
                      key={field.id}
                      className="grid items-end gap-x-4 gap-y-6 p-4 border rounded-lg md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
                    >
                      {/* Per-variant option toggles */}
                      <div className="col-span-full mb-2">
                        <Label className="text-xs font-semibold">
                          Select options for this variant:
                        </Label>
                        <div className="flex flex-wrap gap-4 mt-2">
                          {getAvailableOptions().map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`variant-${index}-opt-${opt.id}`}
                                checked={optionKeys.includes(opt.id)}
                                onCheckedChange={() =>
                                  handleVariantOptionToggle(index, opt.id)
                                }
                                disabled={loading}
                              />
                              <label
                                htmlFor={`variant-${index}-opt-${opt.id}`}
                                className="text-sm font-medium"
                              >
                                {opt.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Option value selectors for selected keys */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2 lg:col-span-1">
                        {optionKeys.map((optId) => (
                          <FormField
                            key={optId}
                            control={form.control}
                            name={`variants.${index}.${optId}` as any}
                            render={({ field: variantField }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  {optionsObj[optId]?.name}
                                </FormLabel>
                                <Select
                                  value={variantField.value || ""}
                                  onValueChange={variantField.onChange}
                                  disabled={loading}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={`Select ${optionsObj[optId]?.name}`}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {catalog.optionValues
                                      .filter((v) => v.optionId === optId)
                                      .map((val) => (
                                        <SelectItem key={val.id} value={val.id}>
                                          {val.value}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.price`}
                          render={({ field: variantField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Price</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...variantField}
                                  onChange={(e) =>
                                    variantField.onChange(
                                      Number(e.target.value)
                                    )
                                  }
                                  disabled={loading}
                                  placeholder="Price"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`variants.${index}.stock`}
                          render={({ field: variantField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Stock</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...variantField}
                                  onChange={(e) =>
                                    variantField.onChange(
                                      Number(e.target.value)
                                    )
                                  }
                                  disabled={loading}
                                  placeholder="Stock"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`variants.${index}.sku`}
                        render={({ field: variantField }) => (
                          <FormItem>
                            <FormLabel className="text-xs">SKU</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input
                                  {...variantField}
                                  disabled={loading}
                                  placeholder="SKU-123"
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={loading}
                                onClick={() => handleGenerateSku(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-sparkles"
                                >
                                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                  <path d="M5 3v4" />
                                  <path d="M19 17v4" />
                                  <path d="M3 5h4" />
                                  <path d="M17 19h4" />
                                </svg>
                              </Button>
                            </div>
                          </FormItem>
                        )}
                      />
                      <div className="flex items-end justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove variant</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          {productId && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                setLoading(true);
                try {
                  await onDelete();
                  toast.success("Product deleted.");
                  router.push(`/${storeId}/products`);
                  router.refresh();
                } catch {
                  toast.error("Failed to delete product.");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Product
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : productId
              ? "Save Changes"
              : "Save Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
