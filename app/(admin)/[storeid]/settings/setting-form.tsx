"use client";

import { UserProfile } from "@clerk/nextjs";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/modals/alert-modal";

const settingsFormSchema = z.object({
  name: z.string().min(1, { message: "Store name is required" }),
});

interface SettingFormProps {
  storeId: string;
  initialData?: { name: string };
}

export const SettingForm: React.FC<SettingFormProps> = ({
  storeId,
  initialData,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof settingsFormSchema>) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${storeId}`, data);
      toast.success("Store updated.");
      router.push(`/${storeId}/dashboard`);
    } catch (error) {
      toast.error("Failed to update store.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(`/api/stores/${storeId}`);
      toast.success("Store deleted.");
      router.push("/");
    } catch (error) {
      toast.error("Failed to delete store.");
    } finally {
      setDeleteLoading(false);
      setOpenDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-10 ">
      {/* Store Name Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={loading}
                        placeholder="Enter store name"
                        className="max-w-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-start gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteLoading}
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  {deleteLoading ? "Deleting..." : "Delete Store"}
                </Button>
                <AlertModal
                  open={openDeleteDialog}
                  loading={deleteLoading}
                  title="Delete Store"
                  description="Are you sure you want to delete this store? This action cannot be undone."
                  confirmText="Delete"
                  cancelText="Cancel"
                  onConfirm={onDelete}
                  onCancel={() => {
                    if (!deleteLoading) setOpenDeleteDialog(false);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Clerk User Settings */}
      <Card >
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <UserProfile routing="hash" />
        </CardContent>
      </Card>
    </div>
  );
};
