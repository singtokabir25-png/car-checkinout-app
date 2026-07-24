import { z } from "zod";

export const USER_ROLES = ["employee", "customer", "Depositor"] as const;
export const TRANSACTION_TYPES = ["check_in", "check_out"] as const;

/** รายการของที่ฝากไว้ — กรอกเองได้อิสระ ไม่จำกัดชนิด (เช่น โต๊ะ, หมวก จากโรงงานภายนอก) */
export const itemDepositSchema = z.object({
  id: z.string(),
  itemName: z.string().trim().min(1, "กรุณาระบุชื่อของ"),
  quantity: z.coerce.number().int().min(1, "จำนวนต้องอย่างน้อย 1").default(1),
  note: z.string().trim().optional().or(z.literal("")),
});
export type ItemDeposit = z.infer<typeof itemDepositSchema>;

/** Equipment/condition checklist items shown in the design. Extend freely. */
export const EQUIPMENT_ITEMS = [
  { id: "Paper core", label: "แกนกระดาษ" },
  { id: "Cardboard", label: "จับจั่ว" },
  { id: "Egg tray", label: "แผงไข่" },
  { id: "Plywood", label: "ไม้อัด" },
  { id: "Plastic tray", label: "ถาดพลาสติก" },
  { id: "Black bal", label: "ลูกดำ" },
  { id: "Strapping", label: "สายรัด" },
  { id: "Thread spool", label: "หลอดด้าย" },
  { id: "Steel", label: "เหล็ก" },
  { id: "Foam", label: "โฟม" },
  { id: "Bottle", label: "ขวด" },
  { id: "Acrylic", label: "อะคิลิค" },
  { id: "Wooden pallet", label: "พาเรทไม้" },
  { id: "Plastic pallet", label: "พาเรทพลาสติก" },
  { id: "Corrugated plastic sheet", label: "ฟิวเจอร์บอร์ด" },
  { id: "Seatbelt/Strap", label: "สายเบลท์" },
  { id: "Sack", label: "กระสอบ" },
  { id: "Fabric", label: "ผ้า" },
  { id: "Spring", label: "สปริง" },
  { id: "Black plastic", label: "พลาสติกดำ" },
  { id: "Plastic bag", label: "ถุงพลาสติก" },
  { id: "None", label: "ไม่มี" },
] as const;

const baseSchema = z.object({
  userRole: z.enum(USER_ROLES, { required_error: "Please select who you are" }),
  transactionType: z.enum(TRANSACTION_TYPES),

  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  contactPhone: z.string().trim().optional().or(z.literal("")),
  company: z.string().trim().optional().or(z.literal("")),

  transactionDate: z.string().min(1, "Date is required"),
  transactionTime: z.string().min(1, "Time is required"),

  plateNumber: z
    .string()
    .trim()
    .min(2, "Plate number is required")
    .max(20, "Plate number looks too long"),
  vehicleMakeModel: z.string().trim().optional().or(z.literal("")),
  odometerKm: z.coerce.number().int().nonnegative().optional(),
  fuelLevel: z.coerce.number().min(0).max(100).optional(),

  equipmentChecklist: z.record(z.boolean()).default({}),
  itemDeposits: z.array(itemDepositSchema).default([]),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),

  inspectionImages: z
    .array(z.instanceof(File))
    .min(1, "Please upload at least one inspection photo")
    .max(8, "Maximum 8 photos"),

  signatureDataUrl: z
    .string()
    .refine((v) => v.startsWith("data:image/"), "Signature is required"),
});

/**
 * Role-aware refinement: customers and Depositor must supply a phone number
 * so the record can be traced back to them; employees don't need one since
 * they're tied to an authenticated Supabase user (created_by).
 * Depositor additionally must supply a company/host reference.
 */
export const transactionFormSchema = baseSchema.superRefine((data, ctx) => {
  if ((data.userRole === "customer" || data.userRole === "Depositor") && !data.contactPhone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["contactPhone"],
      message: "Phone number is required for customers and Depositor",
    });
  }

  if (data.userRole === "Depositor" && !data.company) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["company"],
      message: "Please provide the company or person you're visiting",
    });
  }
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
