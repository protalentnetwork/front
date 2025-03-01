"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { CreateOfficeModal } from "./create-office-modal";
import { EditOfficeModal } from "./edit-office-modal";
import { DeleteOfficeModal } from "./delete-office-modal";
import { useOffices, Office } from "@/components/hooks/use-offices";

export default function OfficeConfigurationPage() {
  // Utilizamos el hook useOffices en lugar de la función fetchOffices
  const { offices, isLoading, error, refreshOffices } = useOffices();
  
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentOffice, setCurrentOffice] = useState<Office | null>(null);
  // Estado para controlar qué menú desplegable está abierto
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Efecto para cerrar el menú desplegable cuando se abre un modal
  useEffect(() => {
    if (openEditDialog || openDeleteDialog) {
      setOpenDropdownId(null);
    }
  }, [openEditDialog, openDeleteDialog]);

  // Manejador para cuando cambia el estado del modal
  const handleModalOpenChange = (open: boolean, setOpen: (open: boolean) => void) => {
    if (!open) {
      // Asegurarnos de que todos los menús desplegables estén cerrados
      setOpenDropdownId(null);
      // Pequeño retraso para asegurar que el DOM se actualice correctamente
      setTimeout(() => {
        setOpen(open);
      }, 10);
    } else {
      setOpen(open);
    }
  };

  // Función para refrescar las oficinas, que devuelve una promesa
  const handleOfficeChange = async () => {
    await refreshOffices();
    return Promise.resolve();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Oficinas</h1>
        <CreateOfficeModal onOfficeCreated={handleOfficeChange} />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Whatsapp</TableHead>
              <TableHead>Telegram</TableHead>
              <TableHead>Bono 1ra carga</TableHead>
              <TableHead>Bono perpetuo</TableHead>
              <TableHead>Carga Mínima</TableHead>
              <TableHead>Retiro Mínimo</TableHead>
              <TableHead>Mínimo Espera Retiro</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[70px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-red-500">
                  Error: {error}
                </TableCell>
              </TableRow>
            ) : offices.length > 0 ? (
              offices.map((office) => (
                <TableRow key={office.id}>
                  <TableCell className="font-medium">{office.name}</TableCell>
                  <TableCell>{office.whatsapp}</TableCell>
                  <TableCell>{office.telegram}</TableCell>
                  <TableCell>{office.firstDepositBonus}</TableCell>
                  <TableCell>{office.perpetualBonus}</TableCell>
                  <TableCell>{office.minDeposit}</TableCell>
                  <TableCell>{office.minWithdrawal}</TableCell>
                  <TableCell>{office.minWithdrawalWait}</TableCell>
                  <TableCell>
                    <Badge variant={office.status === "active" ? "default" : "destructive"}>
                      {office.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu 
                      open={openDropdownId === office.id}
                      onOpenChange={(open) => {
                        setOpenDropdownId(open ? office.id : null);
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentOffice(office);
                            setOpenDropdownId(null); // Cerrar el menú
                            setOpenEditDialog(true);
                          }}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setCurrentOffice(office);
                            setOpenDropdownId(null); // Cerrar el menú
                            setOpenDeleteDialog(true);
                          }}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No hay oficinas disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modales para editar y eliminar con el nuevo manejador */}
      <EditOfficeModal 
        office={currentOffice} 
        open={openEditDialog} 
        onOpenChange={(open) => handleModalOpenChange(open, setOpenEditDialog)} 
        onOfficeUpdated={handleOfficeChange} 
      />
      
      <DeleteOfficeModal 
        office={currentOffice} 
        open={openDeleteDialog} 
        onOpenChange={(open) => handleModalOpenChange(open, setOpenDeleteDialog)}
        onOfficeDeleted={handleOfficeChange} 
      />
    </div>
  );
}
