import { User } from "./users";

export enum AddressType {
  Personal = "personal",
  Clients = "clients",
}

export type Address = {
  id: string;
  user_id: string;
  user?: User;
  type: AddressType;
  name: string;
  taxId: string;
  email: string;
  street: string;
  number: string;
  comment: string;
  zipcode: string;
  city: string;
  state: string;
  country: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
};
