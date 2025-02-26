"use client";

import { useState, useEffect } from 'react';

interface Transaction {
  id: string | number;
  userType: string;
  amount: number;
  description: string;
  status: string;
  dateCreated: string;
  paymentMethod: string;
  email: string;
}

export default function Page() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const sampleData: Transaction[] = [
      {
        id: 103136605567,
        userType: 'Cliente Regular',
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

