import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


const officeData = [
  {
    id: "1",
    name: "Oficina Central",
    whatsapp: "+1234567890",
    telegram: "@oficina_central",
    firstDepositBonus: "10%",
    perpetualBonus: "5%",
    minDeposit: "$50",
    minWithdrawal: "$20",
    minWithdrawalWait: "24h",
    status: "Activo",
  },
];

export default function OfficeConfigurationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Oficinas</h1>
      
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
              <TableHead>Retiro Minimo</TableHead>
              <TableHead>Minimo Espera Retiro</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {officeData.length ? (
              officeData.map((office) => (
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
                    <Badge variant={office.status === "Activo" ? "default" : "destructive"}>
                      {office.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
