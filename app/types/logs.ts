export interface ActivityLog {
  id: string;
  admin_id?: string;
  username?: string;
  action: string;
  entity_type: "product" | "order" | "category" | "admin" | "other";
  entity_id: string;
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
