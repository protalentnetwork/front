'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { GraphicalReports } from '@/components/reports/GraphicalReports'
import { DetailedReports } from '@/components/reports/DetailedReports'

export default function ReportsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reportes</h1>
      
      <Tabs defaultValue="graphical" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="graphical">Reportes Gráficos</TabsTrigger>
          <TabsTrigger value="detailed">Reportes Detalle</TabsTrigger>
          <TabsTrigger value="account">Reportes Cuenta</TabsTrigger>
          <TabsTrigger value="operators">Reportes Operadores</TabsTrigger>
        </TabsList>

        <TabsContent value="graphical">
          <GraphicalReports />
        </TabsContent>
        
        <TabsContent value="detailed">
          <DetailedReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
