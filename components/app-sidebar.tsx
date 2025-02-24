"use client"

import * as React from "react"
import {
  Bot,
  Frame,
  NotebookTabs,
  PieChart,
  Ticket,
  Users,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth" // Ajusta la ruta según donde tengas useAuth

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, role, isOperator } = useAuth()

  // Datos base del sidebar
  const data = {
    user: {
      name: user?.name || "Usuario", // Usamos datos del usuario autenticado
      email: user?.email || "email@example.com",
    },
    navMain: [
      {
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
        isActive: true,
        items: [
          {
            title: "Usuarios de clientes",
            url: "/dashboard/users/clients-users",
          },
        ],
      },
      {
        title: "Cuentas para transferencias",
        url: "/dashboard/transfer-accounts",
        icon: Bot,
      },
      {
        title: "Reportes",
        url: "/dashboard/reports",
        icon: NotebookTabs,
        items: [
          {
            title: "Reportes gráficos",
            url: "/dashboard/reports/graphic-reports",
          },
          {
            title: "Reportes detalles",
            url: "/dashboard/reports/details-reports",
          },
          {
            title: "Reportes de cuentas",
            url: "/dashboard/reports/accounts-reports",
          },
          {
            title: "Reportes de operadores",
            url: "/dashboard/reports/operators-reports",
          },
        ],
      },
    ],
    tickets: [
      {
        name: "Tickets",
        url: "/dashboard/tickets",
        icon: Ticket,
      },
    ],
    projects: [
      {
        name: "Monitoreo landing web",
        url: "/dashboard/web-monitoring",
        icon: Frame,
      },
      {
        name: "Monitoreo de transferencias",
        url: "/dashboard/transfer-monitoring",
        icon: PieChart,
      },
    ],
    others: [
      {
        name: "Recupero por WhatsApp",
        url: "/dashboard/whatsapp-recovery",
        icon: PieChart,
      },
      {
        name: "Chat con clientes",
        url: "/dashboard/chat",
        icon: PieChart,
      },
      {
        name: "Configuración oficina",
        url: "/dashboard/office-configuration",
        icon: PieChart,
      },
      {
        name: "Descarga de cuentas",
        url: "/dashboard/download-accounts",
        icon: PieChart,
      },
      {
        name: "Historial landing web",
        url: "/dashboard/landing-history",
        icon: PieChart,
      },
    ],
  }

  // Filtrar los ítems según el rol
  const filteredNavMain = data.navMain.filter(item => {
    if (isOperator) {
      // Ocultar "Users" y "Cuentas para transferencias" para operadores
      return item.title !== "Users" && item.title !== "Cuentas para transferencias"
    }
    // Admin y Manager ven todo
    return true
  })

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavProjects projects={data.projects} title="Monitoreos" />
        <NavProjects projects={data.tickets} title="Tickets" />
        <NavProjects projects={data.others} title="Otros" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}