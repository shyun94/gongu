import React, { useState } from "react";
import { Calendar } from "./Calendar";
import { Transaction } from "./Calendar/types";
import dayjs from "dayjs";

export const BudgetCalendarPage: React.FC = () => {
  // 샘플 거래 데이터 (실제로는 API에서 가져올 데이터)
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      amount: 50000,
      type: "income",
      date: dayjs().subtract(2, "day"),
      description: "급여",
      category: "급여",
    },
    {
      id: "2",
      amount: 15000,
      type: "expense",
      date: dayjs().subtract(1, "day"),
      description: "점심",
      category: "식비",
    },
    {
      id: "3",
      amount: 30000,
      type: "expense",
      date: dayjs(),
      description: "쇼핑",
      category: "쇼핑",
    },
    {
      id: "4",
      amount: 20000,
      type: "income",
      date: dayjs().add(1, "day"),
      description: "부업",
      category: "부업",
    },
    {
      id: "5",
      amount: 8000,
      type: "expense",
      date: dayjs().add(2, "day"),
      description: "교통비",
      category: "교통",
    },
  ]);

  return (
    <div className="w-full h-full bg-white">
      <Calendar transactions={transactions} />
    </div>
  );
};
