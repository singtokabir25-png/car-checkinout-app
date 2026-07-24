"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { transactionFormSchema, type TransactionFormValues } from "@/lib/validations/transaction";
import { createTransaction } from "@/app/actions";
import { RoleSelector } from "@/components/RoleSelector";
import { EquipmentChecklist } from "@/components/EquipmentChecklist";
import { ItemDepositList } from "@/components/ItemDepositList";
import { ImageUpload } from "@/components/ImageUpload";
import { SignaturePad } from "@/components/SignaturePad";
import type { TransactionType } from "@/types/database";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const errorClass = "mt-1 text-sm text-red-600";

export function CheckForm({ transactionType }: { transactionType: TransactionType }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      transactionType,
      transactionDate: new Date().toISOString().slice(0, 10),
      transactionTime: new Date().toTimeString().slice(0, 5),
      equipmentChecklist: {},
      itemDeposits: [],
      inspectionImages: [],
      signatureDataUrl: "",
    },
  });

  const userRole = watch("userRole");

  const onSubmit = async (values: TransactionFormValues) => {
    setSubmitError(null);
    try {
      const inspectionImages = await Promise.all(
        values.inspectionImages.map(async (file) => ({
          name: file.name,
          dataUrl: await fileToDataUrl(file),
        }))
      );

      const result = await createTransaction({
        userRole: values.userRole,
        transactionType: values.transactionType,
        fullName: values.fullName,
        contactPhone: values.contactPhone,
        company: values.company,
        transactionDate: values.transactionDate,
        transactionTime: values.transactionTime,
        plateNumber: values.plateNumber,
        vehicleMakeModel: values.vehicleMakeModel,
        odometerKm: values.odometerKm,
        fuelLevel: values.fuelLevel,
        equipmentChecklist: values.equipmentChecklist,
        itemDeposits: values.itemDeposits,
        notes: values.notes,
        inspectionImages,
        signatureDataUrl: values.signatureDataUrl,
      });

      if ("error" in result) {
        setSubmitError(result.error);
        return;
      }

      router.push(`/summary/${result.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* ขั้นตอนที่ 1: เลือกบทบาท */}
      <Controller
        name="userRole"
        control={control}
        render={({ field }) => (
          <RoleSelector value={field.value} onChange={field.onChange} error={errors.userRole?.message} />
        )}
      />

      {/* ขั้นตอนที่ 2: ข้อมูลพื้นฐาน */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>ชื่อ-นามสกุล</label>
          <input {...register("fullName")} className={inputClass} placeholder="เช่น สมชาย ใจดี" />
          {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
        </div>

        <div>
          <label className={labelClass}>
            เบอร์โทรศัพท์ {(userRole === "customer" || userRole === "Depositor") && <span className="text-red-500">*</span>}
          </label>
          <input {...register("contactPhone")} className={inputClass} placeholder="081-234-5678" />
          {errors.contactPhone && <p className={errorClass}>{errors.contactPhone.message}</p>}
        </div>

        {userRole === "Depositor" && (
          <div className="sm:col-span-2">
            <label className={labelClass}>บริษัท / บุคคลที่มาติดต่อ</label>
            <input {...register("company")} className={inputClass} placeholder="เช่น บริษัท เอบีซี — ติดต่อคุณสมชาย" />
            {errors.company && <p className={errorClass}>{errors.company.message}</p>}
          </div>
        )}

        <div>
          <label className={labelClass}>วันที่</label>
          <input type="date" {...register("transactionDate")} className={inputClass} />
          {errors.transactionDate && <p className={errorClass}>{errors.transactionDate.message}</p>}
        </div>

        <div>
          <label className={labelClass}>เวลา</label>
          <input type="time" {...register("transactionTime")} className={inputClass} />
          {errors.transactionTime && <p className={errorClass}>{errors.transactionTime.message}</p>}
        </div>

        <div>
          <label className={labelClass}>ทะเบียนรถ</label>
          <input
            {...register("plateNumber")}
            className={cn(inputClass, "uppercase")}
            placeholder="1กก-1234"
          />
          {errors.plateNumber && <p className={errorClass}>{errors.plateNumber.message}</p>}
        </div>

        <div>
          <label className={labelClass}>ยี่ห้อ / รุ่นรถ</label>
          <input {...register("vehicleMakeModel")} className={inputClass} placeholder="เช่น Toyota Camry" />
        </div>
      </section>

      {/* ขั้นตอนที่ 3: ตรวจสอบอุปกรณ์ / สภาพรถ */}
      <Controller
        name="equipmentChecklist"
        control={control}
        render={({ field }) => <EquipmentChecklist value={field.value} onChange={field.onChange} />}
      />

      {/* รายการของฝาก — เฉพาะ  (เช่น โรงงานภายนอกนำของมาฝาก) */}
      {userRole === "Depositor" && (
        <Controller
          name="itemDeposits"
          control={control}
          render={({ field }) => <ItemDepositList value={field.value} onChange={field.onChange} />}
        />
      )}

      {/* ขั้นตอนที่ 4: รูปภาพ */}
      <Controller
        name="inspectionImages"
        control={control}
        render={({ field }) => (
          <ImageUpload value={field.value} onChange={field.onChange} error={errors.inspectionImages?.message as string} />
        )}
      />

      {/* หมายเหตุ */}
      <div>
        <label className={labelClass}>หมายเหตุ (ถ้ามี)</label>
        <textarea {...register("notes")} rows={3} className={inputClass} placeholder="ระบุหมายเหตุเพิ่มเติม..." />
      </div>

      {/* ขั้นตอนที่ 5: ลายเซ็น */}
      <Controller
        name="signatureDataUrl"
        control={control}
        render={({ field }) => (
          <SignaturePad
            value={field.value}
            onChange={field.onChange}
            error={errors.signatureDataUrl?.message}
            label={
              transactionType === "check_in"
                ? "ลายเซ็น (ยืนยันการส่งมอบรถสำหรับเช็คอิน)"
                : "ลายเซ็น (ยืนยันการรับรถคืนสำหรับเช็คเอาท์)"
            }
          />
        )}
      />

      {submitError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting
          ? "กำลังบันทึก..."
          : `ยืนยัน${transactionType === "check_in" ? "เช็คอิน" : "เช็คเอาท์"}`}
      </button>
    </form>
  );
}
