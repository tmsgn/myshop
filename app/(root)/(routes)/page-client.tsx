"use client";

import { StoreModal } from "@/components/modals/store-modal";

export default function RootPageClient() {
  // Modal should always be open and cannot be closed
  return <StoreModal isOpen={true} onClose={() => {}} />;
}
