"use server";

import { createClient } from "@/lib/supabase/server";
import { v4 as uuid } from "uuid";
import type { Transaction, UserRole, TransactionType } from "@/types/database";

export interface CreateTransactionInput {
  userRole: UserRole;
  transactionType: TransactionType;
  fullName: string;
  contactPhone?: string;
  company?: string;
  transactionDate: string;
  transactionTime: string;
  plateNumber: string;
  vehicleMakeModel?: string;
  odometerKm?: number;
  fuelLevel?: number;
  equipmentChecklist: Record<string, boolean>;
  itemDeposits: { id: string; itemName: string; quantity: number; note?: string }[];
  notes?: string;
  /** base64 data URLs from the browser (File -> dataURL happens client-side) */
  inspectionImages: { name: string; dataUrl: string }[];
  signatureDataUrl: string;
}

function dataUrlToBuffer(dataUrl: string) {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? "image/png";
  return { buffer: Buffer.from(base64, "base64"), mime };
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<{ id: string } | { error: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    // 1. Upload inspection images
    const imageUrls: string[] = [];
    for (const image of input.inspectionImages) {
      const { buffer, mime } = dataUrlToBuffer(image.dataUrl);
      const safePlateNumber = encodeURIComponent(input.plateNumber);
      const path = `${safePlateNumber}/${uuid()}-${image.name}`;

      const { error: uploadError } = await supabase.storage
        .from("inspection-images")
        .upload(path, buffer, { contentType: mime, upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("inspection-images")
        .getPublicUrl(path);

      imageUrls.push(publicUrl.publicUrl);
    }

    // 2. Upload signature
    const { buffer: sigBuffer, mime: sigMime } = dataUrlToBuffer(input.signatureDataUrl);
    const sigPath = `${input.plateNumber}/${uuid()}-signature.png`;

    const { error: sigUploadError } = await supabase.storage
      .from("signatures")
      .upload(sigPath, sigBuffer, { contentType: sigMime, upsert: false });

    if (sigUploadError) throw sigUploadError;

    const { data: sigPublicUrl } = supabase.storage
      .from("signatures")
      .getPublicUrl(sigPath);

    // 3. Insert the transaction row
    const insertPayload: Partial<Transaction> = {
      user_role: input.userRole,
      full_name: input.fullName,
      contact_phone: input.contactPhone || null,
      company: input.company || null,
      created_by: user?.id ?? null,
      transaction_type: input.transactionType,
      transaction_date: input.transactionDate,
      transaction_time: input.transactionTime,
      plate_number: input.plateNumber.toUpperCase(),
      vehicle_make_model: input.vehicleMakeModel || null,
      odometer_km: input.odometerKm ?? null,
      fuel_level: input.fuelLevel ?? null,
      equipment_checklist: input.equipmentChecklist,
      item_deposits: input.itemDeposits,
      notes: input.notes || null,
      inspection_image_urls: imageUrls,
      signature_url: sigPublicUrl.publicUrl,
      status: "completed",
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert(insertPayload as any)
      .select("id")
      .single();

    if (error) throw error;

    // บังคับแปลง Type ของ data เพื่อป้องกันปัญหา never type บน Vercel build
    const result = data as { id: string };
    return { id: result.id };
  } catch (err) {
    console.error("createTransaction failed:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function getTransaction(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Transaction;
}