export type UserRole = 'employee' | 'customer' | 'Depositor';
export type TransactionType = "check_in" | "check_out";
export type TransactionStatus = "draft" | "completed" | "voided";

/** Keys correspond to checklist item ids used by <EquipmentChecklist />. */
export type EquipmentChecklistMap = Record<string, boolean>;

/** A single item a Depositor/customer has left with the site. */
export interface ItemDepositRow {
  id: string;
  itemName: string;
  quantity: number;
  note?: string;
}

export interface Transaction {
  id: string;
  created_at: string;
  updated_at: string;

  user_role: UserRole;
  full_name: string;
  contact_phone: string | null;
  company: string | null;

  created_by: string | null;

  transaction_type: TransactionType;
  transaction_date: string; // YYYY-MM-DD
  transaction_time: string; // HH:MM:SS
  plate_number: string;
  vehicle_make_model: string | null;
  odometer_km: number | null;
  fuel_level: number | null;

  equipment_checklist: EquipmentChecklistMap;
  item_deposits: ItemDepositRow[];
  notes: string | null;

  inspection_image_urls: string[];
  signature_url: string | null;

  status: TransactionStatus;
  related_transaction_id: string | null;
}

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: Transaction;
        Insert: Partial<Transaction> &
          Pick<
            Transaction,
            "user_role" | "full_name" | "transaction_type" | "plate_number"
          >;
        Update: Partial<Transaction>;
      };
    };
  };
}
