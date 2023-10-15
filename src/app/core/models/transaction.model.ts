export interface Transaction {
  id: string;
  purchasedItem: string;
  category: string;
  date: Date;
  amountSpent: number;
  userId: string;
}
