-- Migration: add item_deposits column
-- รันใน Supabase SQL editor — ปลอดภัยกับข้อมูลเดิม ไม่ลบอะไรทิ้ง

alter table public.transactions
  add column if not exists item_deposits jsonb not null default '[]'::jsonb;

comment on column public.transactions.item_deposits is
  'รายการของฝากจากบุคคลภายนอก เช่น Depositor เอาโต๊ะ/หมวก มาฝากไว้ — array ของ {id, itemName, quantity, note}';
