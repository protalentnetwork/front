"use client";

import { useState, useEffect } from 'react';

interface Transaction {
  id: string | number;
  description: string;
  amount: number;
  status?: string; // Puede ser 'approved', 'Pending', 'Aceptado', etc.
  date_created?: string;
  payment_method_id?: string;
  payer_email?: string;
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Monitoreo de Transferencias</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">ID de Pago</th>
            <th className="py-2 px-4 border-b">Descripción</th>
            <th className="py-2 px-4 border-b">Monto</th>
            <th className="py-2 px-4 border-b">Estado</th>
            <th className="py-2 px-4 border-b">Fecha de Creación</th>
            <th className="py-2 px-4 border-b">Método de Pago</th>
            <th className="py-2 px-4 border-b">Email del Pagador</th>
            <th className="py-2 px-4 border-b">Acción</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{transaction.id}</td>
              <td className="py-2 px-4 border-b">{transaction.description}</td>
              <td className="py-2 px-4 border-b">${transaction.amount.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{transaction.status || 'Pending'}</td>
              <td className="py-2 px-4 border-b">
                {transaction.date_created ? new Date(transaction.date_created).toLocaleString() : 'No disponible'}
              </td>
              <td className="py-2 px-4 border-b">{transaction.payment_method_id || 'No disponible'}</td>
              <td className="py-2 px-4 border-b">{transaction.payer_email || 'No disponible'}</td>
              <td className="py-2 px-4 border-b">
                {transaction.status === 'Aceptado' ? (
                  <span className="bg-green-500 text-white px-4 py-2 rounded">Aceptado</span>
                ) : (
                  <button
                    onClick={() => handleAccept(transaction.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={transaction.status === 'Aceptado'}
                  >
                    Pending
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {transactions.length === 0 && <p className="mt-4">No hay transacciones disponibles</p>}
    </div>
  );

  function handleAccept(id: string | number) {
    setTransactions(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.id === id ? { ...transaction, status: 'Aceptado' } : transaction
      )
    );
  }
}