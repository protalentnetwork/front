"use client";

import { useState, useEffect } from 'react';

interface Transaction {
  id: string | number;
  description: string;
  amount: number;
  status?: string;
  dateCreated?: string;
  dateApproved?: string;
  dateLastUpdated?: string;
  moneyReleaseDate?: string;
  statusDetail?: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  payerId?: number;
  payerEmail?: string;
  payerIdentification?: {
    type?: string;
    number?: string;
  };
  payerType?: string;
  transactionDetails?: {
    netReceivedAmount?: number;
    totalPaidAmount?: number;
    overpaidAmount?: number;
    installmentAmount?: number;
  };
  additionalInfo?: {
    items?: Array<{
      id?: string;
      title?: string;
      description?: string;
      quantity?: number;
      unit_price?: number;
    }>;
    payer?: {
      registrationDate?: string;
    };
    shipments?: {
      receiverAddress?: {
        streetName?: string;
        streetNumber?: string;
        zipCode?: string;
        cityName?: string;
        stateName?: string;
      };
    };
  };
  externalReference?: string;
  feeDetails?: Array<{
    type?: string;
    amount?: number;
    feePayer?: string;
  }>;
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
          <li key={transaction.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
            <strong>ID de Pago:</strong> {transaction.id}<br />
            <strong>Descripción:</strong> {transaction.description}<br />
            <strong>Monto:</strong> ${transaction.amount.toFixed(2)}<br />
            <strong>Estado:</strong> {transaction.status || 'Sin estado'} {transaction.statusDetail ? `(${transaction.statusDetail})` : ''}<br />
            <strong>Fecha de Creación:</strong> {new Date(transaction.dateCreated || '').toLocaleString()}<br />
            <strong>Fecha de Aprobación:</strong> {transaction.dateApproved ? new Date(transaction.dateApproved).toLocaleString() : 'No disponible'}<br />
            <strong>Fecha de Última Actualización:</strong> {transaction.dateLastUpdated ? new Date(transaction.dateLastUpdated).toLocaleString() : 'No disponible'}<br />
            <strong>Fecha de Liberación de Fondos:</strong> {transaction.moneyReleaseDate ? new Date(transaction.moneyReleaseDate).toLocaleString() : 'No disponible'}<br />
            <strong>Método de Pago:</strong> {transaction.paymentMethodId || 'No disponible'}<br />
            <strong>Tipo de Pago:</strong> {transaction.paymentTypeId || 'No disponible'}<br />
            <strong>ID del Pagador:</strong> {transaction.payerId || 'No disponible'}<br />
            <strong>Email del Pagador:</strong> {transaction.payerEmail || 'No disponible'}<br />
            <strong>Identificación del Pagador:</strong> {transaction.payerIdentification ? `${transaction.payerIdentification.type || ''} ${transaction.payerIdentification.number || ''}` : 'No disponible'}<br />
            <strong>Tipo de Pagador:</strong> {transaction.payerType || 'No disponible'}<br />
            {transaction.transactionDetails && (
              <>
                <strong>Monto Neto Recibido:</strong> ${transaction.transactionDetails.netReceivedAmount?.toFixed(2) || 'No disponible'}<br />
                <strong>Monto Total Pagado:</strong> ${transaction.transactionDetails.totalPaidAmount?.toFixed(2) || 'No disponible'}<br />
                <strong>Monto Sobregirado:</strong> ${transaction.transactionDetails.overpaidAmount?.toFixed(2) || 'No disponible'}<br />
                <strong>Monto por Cuota:</strong> ${transaction.transactionDetails.installmentAmount?.toFixed(2) || 'No disponible'}<br />
              </>
            )}
            {transaction.additionalInfo?.items && transaction.additionalInfo.items.length > 0 && (
              <>
                <strong>Ítems Comprados:</strong><br />
                {transaction.additionalInfo.items.map((item, index) => (
                  <div key={index}>
                    - {item.title} (Cantidad: {item.quantity}, Precio: {item.unit_price?.toFixed(2)})
                  </div>
                ))}
              </>
            )}
            {transaction.externalReference && (
              <>
                <strong>Referencia Externa:</strong> {transaction.externalReference}<br />
              </>
            )}
            {transaction.feeDetails && transaction.feeDetails.length > 0 && (
              <>
                <strong>Detalles de Comisiones:</strong><br />
                {transaction.feeDetails.map((fee, index) => (
                  <div key={index}>
                    - Tipo: {fee.type}, Monto: ${fee.amount?.toFixed(2)}, Pagador: {fee.feePayer}
                  </div>
                ))}
              </>
            )}
          </li>
        ))}
      </ul>
      {transactions.length === 0 && <p>No hay transacciones disponibles</p>}
    </div>
  );
}