export interface ActivityLog {
  id: number;
  admin_id?: number;
  action: string;
  entity_type: "product" | "order" | "category" | "admin" | "other";
  entity_id: number;
  entity_name?: string;
  old_value?: string;
  new_value?: string;
  details?: string;
  created_at: string;
  updated_at?: string;
}

export type LogActionType = 
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "CONFIRM"
  | "SHIP"
  | "CANCEL"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT"
  | "IMPORT"
  | "OTHER";
