"use client";

import { useState, useEffect } from 'react';

interface Transaction {
  id: string | number;
  userType: string; // Tipo de usuario (por ejemplo, pagador)
  amount: number;
  description: string;
  status: string;
  dateCreated: string;
  paymentMethod: string; // Método de pago (por ejemplo, transferencia bancaria)
  email: string; // Email del usuario/pagador
}

export default function Page() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simular la obtención de datos del backend (puedes reemplazar esto con tu fetch real)
  useEffect(() => {
    setLoading(true);
    // Simulación de datos (en lugar de fetch)
    const sampleData: Transaction[] = [
      {
        id: 103136605567,
        userType: 'Cliente Regular', // Ejemplo basado en payer_type o payer_identification
        amount: 1,
        description: 'Bank Transfer',
        status: 'approved',
        dateCreated: '2025-02-26T15:56:41.000-04:00',
        paymentMethod: 'Transferencia Bancaria (CVU)',
        email: 'sandra_fumagalli_liceo@yahoo.com.ar',
      },
    ];
    setTransactions(sampleData);
    setLoading(false);
  }, []);

  if (loading) return <div>Cargando transferencias...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Monitoreo de Transferencias</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">ID de Pago</th>
            <th className="py-2 px-4 border-b">Tipo de Usuario</th>
            <th className="py-2 px-4 border-b">Monto</th>
            <th className="py-2 px-4 border-b">Descripción</th>
            <th className="py-2 px-4 border-b">Estado</th>
            <th className="py-2 px-4 border-b">Fecha de Creación</th>
            <th className="py-2 px-4 border-b">Método de Pago</th>
            <th className="py-2 px-4 border-b">Email</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{transaction.id}</td>
              <td className="py-2 px-4 border-b">{transaction.userType}</td>
              <td className="py-2 px-4 border-b">${transaction.amount.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{transaction.description}</td>
              <td className="py-2 px-4 border-b">{transaction.status}</td>
              <td className="py-2 px-4 border-b">
                {new Date(transaction.dateCreated).toLocaleString()}
              </td>
              <td className="py-2 px-4 border-b">{transaction.paymentMethod}</td>
              <td className="py-2 px-4 border-b">{transaction.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {transactions.length === 0 && <p className="mt-4">No hay transferencias disponibles</p>}
    </div>
  );
}