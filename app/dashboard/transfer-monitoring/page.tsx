"use client";

import { useState, useEffect } from 'react';

interface Transaction {
  id: string | number;
  description: string;
  amount: number;
  status?: string;
  date_created?: string; // Usar el nombre exacto del backend (snake_case)
  date_approved?: string;
  date_last_updated?: string;
  money_release_date?: string;
  status_detail?: string;
  payment_method_id?: string;
  payment_type_id?: string;
  payer_id?: string | number; // Ajustar para coincidir con el backend (string en este caso)
  payer_email?: string;
  payer_identification?: {
    type?: string;
    number?: string;
  } | null;
  payer_type?: string | null;
  transaction_details?: {
    acquirer_reference?: string | null;
    bank_transfer_id?: number;
    external_resource_url?: string | null;
    financial_institution?: string;
    installment_amount?: number;
    net_received_amount?: number;
    overpaid_amount?: number;
    payable_deferral_period?: string | null;
    payment_method_reference_id?: string | null;
    total_paid_amount?: number;
    transaction_id?: string;
  } | null;
  additional_info?: {
    tracking_id?: string;
    items?: Array<{
      id?: string;
      title?: string;
      description?: string;
      quantity?: number;
      unit_price?: number;
    }>;
    payer?: {
      registration_date?: string; // Corregir a snake_case
    };
    shipments?: {
      receiver_address?: {
        street_name?: string;
        street_number?: string;
        zip_code?: string;
        city_name?: string;
        state_name?: string;
      };
    };
  } | null;
  external_reference?: string | null;
  fee_details?: Array<{
    type?: string;
    amount?: number;
    fee_payer?: string;
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
            <strong>Estado:</strong> {transaction.status || 'Sin estado'} {transaction.status_detail ? `(${transaction.status_detail})` : ''}<br />
            <strong>Fecha de Creación:</strong> {transaction.date_created ? new Date(transaction.date_created).toLocaleString() : 'No disponible'}<br />
            <strong>Fecha de Aprobación:</strong> {transaction.date_approved ? new Date(transaction.date_approved).toLocaleString() : 'No disponible'}<br />
            <strong>Fecha de Última Actualización:</strong> {transaction.date_last_updated ? new Date(transaction.date_last_updated).toLocaleString() : 'No disponible'}<br />
            <strong>Fecha de Liberación de Fondos:</strong> {transaction.money_release_date ? new Date(transaction.money_release_date).toLocaleString() : 'No disponible'}<br />
            <strong>Método de Pago:</strong> {transaction.payment_method_id || 'No disponible'}<br />
            <strong>Tipo de Pago:</strong> {transaction.payment_type_id || 'No disponible'}<br />
            <strong>ID del Pagador:</strong> {transaction.payer_id || 'No disponible'}<br />
            <strong>Email del Pagador:</strong> {transaction.payer_email || 'No disponible'}<br />
            <strong>Identificación del Pagador:</strong> {transaction.payer_identification ? `${transaction.payer_identification.type || ''} ${transaction.payer_identification.number || ''}` : 'No disponible'}<br />
            <strong>Tipo de Pagador:</strong> {transaction.payer_type || 'No disponible'}<br />
            {transaction.transaction_details && (
              <>
                <strong>Monto Neto Recibido:</strong> ${transaction.transaction_details.net_received_amount?.toFixed(2) || 'No disponible'}<br />
                <strong>Monto Total Pagado:</strong> ${transaction.transaction_details.total_paid_amount?.toFixed(2) || 'No disponible'}<br />
                <strong>Monto Sobregirado:</strong> ${transaction.transaction_details.overpaid_amount?.toFixed(2) || 'No disponible'}<br />
                <strong>Monto por Cuota:</strong> ${transaction.transaction_details.installment_amount?.toFixed(2) || 'No disponible'}<br />
                <strong>ID de Transferencia Bancaria:</strong> {transaction.transaction_details.bank_transfer_id || 'No disponible'}<br />
                <strong>Institución Financiera:</strong> {transaction.transaction_details.financial_institution || 'No disponible'}<br />
                <strong>ID de Transacción:</strong> {transaction.transaction_details.transaction_id || 'No disponible'}<br />
              </>
            )}
            {transaction.additional_info?.items && transaction.additional_info.items.length > 0 && (
              <>
                <strong>Ítems Comprados:</strong><br />
                {transaction.additional_info.items.map((item, index) => (
                  <div key={index}>
                    - {item.title} (Cantidad: {item.quantity}, Precio: ${item.unit_price?.toFixed(2)})
                  </div>
                ))}
              </>
            )}
            {transaction.additional_info?.tracking_id && (
              <>
                <strong>ID de Seguimiento:</strong> {transaction.additional_info.tracking_id}<br />
              </>
            )}
            {transaction.external_reference && (
              <>
                <strong>Referencia Externa:</strong> {transaction.external_reference}<br />
              </>
            )}
            {transaction.fee_details && transaction.fee_details.length > 0 && (
              <>
                <strong>Detalles de Comisiones:</strong><br />
                {transaction.fee_details.map((fee, index) => (
                  <div key={index}>
                    - Tipo: {fee.type}, Monto: ${fee.amount?.toFixed(2)}, Pagador: {fee.fee_payer}
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