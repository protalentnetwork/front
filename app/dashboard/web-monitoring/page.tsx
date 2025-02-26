"use client";

import { useState, useEffect } from 'react';

interface Transaction {
  description: string;
  amount: number;
  id?: number | string;
  status?: string;
}

export default function Page() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions`)
      .then(response => {
        if (!response.ok) throw new Error('Error al obtener transacciones');
        return response.json();
      })
      .then(data => setTransactions(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando transacciones...</div>;
  if (error) return <div>Error: {error}</div>;

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