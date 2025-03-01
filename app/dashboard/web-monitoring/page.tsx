"use client";

import { RoleGuard } from '@/components/role-guard';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  if (loading) return <div className="flex justify-center items-center p-8">Cargando transacciones...</div>;
  if (error) return <div className="flex justify-center items-center p-8 text-red-500">Error: {error}</div>;

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'Pending') {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    }
    if (status === 'Aceptado' || status === 'approved') {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Aceptado</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <RoleGuard allowedRoles={['admin', 'encargado']}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Monitoreo de Transferencias</h1>
        
        {transactions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hay transacciones disponibles</p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID de Pago</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead>Email del Pagador</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {transaction.date_created 
                        ? new Date(transaction.date_created).toLocaleString() 
                        : 'No disponible'}
                    </TableCell>
                    <TableCell>{transaction.payment_method_id || 'No disponible'}</TableCell>
                    <TableCell>{transaction.payer_email || 'No disponible'}</TableCell>
                    <TableCell>
                      {transaction.status === 'Aceptado' ? (
                        <Badge className="bg-green-100 text-green-800">Aceptado</Badge>
                      ) : (
                        <Button 
                          onClick={() => handleAccept(transaction.id)}
                          variant="default"
                          size="sm"
                          disabled={transaction.status === 'Aceptado'}
                        >
                          Aceptar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </RoleGuard>
  );

  function handleAccept(id: string | number) {
    setTransactions(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.id === id ? { ...transaction, status: 'Aceptado' } : transaction
      )
    );
  }
}