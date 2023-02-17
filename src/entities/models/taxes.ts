import { User } from "./users";

export enum TaxCalcType {
  Percentage = "percentage",
  Fixed = "fixed",
}

export type Tax = {
  id: string;
  user_id: string;
  user?: User;
  name: string;
  rate: number;
  calc_type: TaxCalcType;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
};
