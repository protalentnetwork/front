import { useState, useEffect } from 'react';

interface Transaction {
  description: string;
  amount: number;
  id?: number | string;
  status?: string;
}

export default function Page() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions`)
      .then(response => response.json())
      .then(data => setTransactions(data))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div>
      <h1>Monitoreo landing web</h1>
      <ul>
        {transactions.map((transaction, index) => (
          <li key={index}>{transaction.description} - ${transaction.amount}</li>
        ))}
      </ul>
    </div>
  );
}