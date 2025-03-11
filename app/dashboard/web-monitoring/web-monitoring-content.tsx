"use client";

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
import { TableSkeleton, type ColumnConfig } from '@/components/ui/table-skeleton';
import { SkeletonLoader } from "@/components/skeleton-loader";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: string | number;
  description: string;
  amount: number;
  status?: string; // Puede ser 'approved', 'Pending', 'Aceptado', etc.
  date_created?: string;
  payment_method_id?: string;
  payer_email?: string;
}

interface TransactionUpdateData {
  transactions: Transaction[];
  newTransaction?: Transaction;
}

export function WebMonitoringContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Configuración de columnas para la tabla de monitoreo web (para los skeletons)
  const tableColumns: ColumnConfig[] = [
    { width: 'w-[100px]', cell: { type: 'text', widthClass: 'w-20' } },     // ID de Pago
    { cell: { type: 'text', widthClass: 'w-full' } },                       // Descripción
    { cell: { type: 'text', widthClass: 'w-24' } },                         // Monto
    { cell: { type: 'badge', widthClass: 'w-24' } },                        // Estado
    { cell: { type: 'text', widthClass: 'w-40' } },                         // Fecha de Creación
    { cell: { type: 'text', widthClass: 'w-32' } },                         // Método de Pago
    { cell: { type: 'text', widthClass: 'w-40' } },                         // Email del Pagador
    { cell: { type: 'action', widthClass: 'w-24', align: 'center' } },      // Acción
  ];

  // Cargar transacciones iniciales y configurar WebSocket
  useEffect(() => {
    // Función para cargar transacciones desde la API
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/transactions`);
        if (!response.ok) {
          throw new Error(`Error al obtener transacciones: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Datos recibidos del backend:', data);
        
        // Agregamos un pequeño retraso para mostrar el skeleton
        setTimeout(() => {
          setTransactions(data);
          setError(null);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error en el fetch:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsLoading(false);
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
    socket.on('transaction-updated', (data: TransactionUpdateData) => {
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

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'Pending') {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    }
    if (status === 'Aceptado' || status === 'approved') {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Aceptado</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };
  
  // Componentes para alternar entre el skeleton y el contenido real
  const HeaderContent = (
    <h1 className="text-2xl font-bold mb-4">Monitoreo de Transferencias</h1>
  );
  
  const HeaderSkeleton = (
    <Skeleton className="h-8 w-64 mb-4" />
  );
  
  const ButtonContent = (
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
  );
  
  const ButtonSkeleton = (
    <div className="flex justify-between items-center mb-4">
      <Skeleton className="h-10 w-56" />
    </div>
  );
  
  // Tabla con datos o mensaje de "no hay datos"
  const TableContent = transactions.length === 0 ? (
    <Card className="p-8 text-center">
      <p className="text-muted-foreground">
        {error ? `Error: ${error}` : "No hay transacciones disponibles"}
      </p>
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
  );

  return (
    <div className="container mx-auto p-4">
      {/* Título con skeleton */}
      <SkeletonLoader 
        skeleton={HeaderSkeleton}
        isLoading={isLoading}
      >
        {HeaderContent}
      </SkeletonLoader>
      
      {/* Botón con skeleton */}
      <SkeletonLoader 
        skeleton={ButtonSkeleton}
        isLoading={isLoading}
      >
        {ButtonContent}
      </SkeletonLoader>
      
      {/* Tabla con skeleton */}
      <SkeletonLoader 
        skeleton={
          <Card>
            <TableSkeleton columns={tableColumns} rowCount={8} />
          </Card>
        }
        isLoading={isLoading}
      >
        {TableContent}
      </SkeletonLoader>
    </div>
  );
} 