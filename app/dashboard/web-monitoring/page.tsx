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
import { toast } from "sonner";
import io from "socket.io-client";

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

  // Cargar transacciones iniciales y configurar WebSocket
  useEffect(() => {
    // Función para cargar transacciones desde la API
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions`);
        if (!response.ok) {
          throw new Error(`Error al obtener transacciones: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Datos recibidos del backend:', data);
        setTransactions(data);
        setError(null);
      } catch (err: any) {
        console.error('Error en el fetch:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Cargar transacciones iniciales
    fetchTransactions();

    // Configurar conexión WebSocket
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000');
    
    socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket para actualizaciones de transacciones');
    });
    
    socket.on('disconnect', () => {
      console.log('Desconectado del servidor WebSocket');
    });
    
    // Escuchar evento de actualización de transacciones
    socket.on('transaction-updated', (data) => {
      console.log('Actualización de transacciones recibida:', data);
      
      // Actualizar el estado con las nuevas transacciones
      if (data.transactions) {
        setTransactions(data.transactions);
        
        // Mostrar notificación si hay una nueva transacción
        if (data.newTransaction) {
          toast.success('Nueva transacción recibida', {
            description: `ID: ${data.newTransaction.id} - $${data.newTransaction.amount}`
          });
        }
      }
    });
    
    // Limpiar al desmontar
    return () => {
      console.log('Desconectando del servidor WebSocket...');
      socket.disconnect();
    };
  }, []);

  // Función para manejar la aceptación de una transacción
  const handleAccept = async (id: string | number) => {
    try {
      // Actualizar optimistamente el UI
      setTransactions(prevTransactions =>
        prevTransactions.map(transaction =>
          transaction.id === id ? { ...transaction, status: 'Aceptado' } : transaction
        )
      );
      
      // Enviar la actualización al servidor
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions/${id}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al aceptar la transacción');
      }
      
      toast.success('Transacción aceptada correctamente');
      
    } catch (error) {
      console.error('Error al aceptar transacción:', error);
      toast.error('Error al aceptar la transacción');
      
      // Revertir el cambio optimista en caso de error
      setTransactions(prevTransactions =>
        prevTransactions.map(transaction =>
          transaction.id === id ? { ...transaction, status: 'Pending' } : transaction
        )
      );
    }
  };

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
        
        <div className="flex justify-between items-center mb-4">
          <Button 
            onClick={() => 
              fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ipn/check-recent`)
                .then(res => res.json())
                .then(data => {
                  if (data.status === 'success') {
                    toast.success(`Verificación completada: ${data.transactions?.length || 0} nuevas transacciones`);
                  } else {
                    toast.error(data.message || 'Error al verificar transacciones');
                  }
                })
                .catch(err => {
                  console.error('Error:', err);
                  toast.error('Error al verificar transacciones');
                })
            }
            variant="outline"
          >
            Verificar Nuevas Transacciones
          </Button>
        </div>
        
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
                      {transaction.status === 'Aceptado' || transaction.status === 'approved' ? (
                        <Badge className="bg-green-100 text-green-800">Aceptado</Badge>
                      ) : (
                        <Button 
                          onClick={() => handleAccept(transaction.id)}
                          variant="default"
                          size="sm"
                          disabled={transaction.status === 'Aceptado' || transaction.status === 'approved'}
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
}