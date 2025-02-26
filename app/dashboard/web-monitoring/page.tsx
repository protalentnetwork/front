"use client";

import { useState, useEffect } from 'react';

interface Transaction {
  id: string | number;
  description: string;
  amount: number;
  status?: string;
  dateCreated?: string;
}

export default function Page() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al obtener transacciones: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Datos recibidos del backend:', data);
        setTransactions(data);
      })
      .catch(err => {
        console.error('Error en el fetch:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando transacciones...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Monitoreo landing web</h1>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.description} - ${transaction.amount} (Estado: {transaction.status || 'Sin estado'})
          </li>
        ))}
      </ul>
    </div>
  );
}