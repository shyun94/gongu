import { Dayjs } from "dayjs";

export type TMonth = string; // "YYYY-MM" format
export type TWeek = Dayjs[];

export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  date: Dayjs;
  description?: string;
  category?: string;
}
