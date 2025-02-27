"use client"

import * as React from "react"
import { useMemo } from "react"
import {
  CircleHelp,
  LampDesk,
  Landmark,
  MessagesSquare,
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

// Datos estáticos del sidebar fuera del componente
const navMainItems = [
  {
    title: "Usuarios",
    url: "/dashboard/users",
    icon: Users,
    isActive: true,
  },
  {
    title: "Cuentas para transferencias",
    url: "/dashboard/transfer-accounts",
    icon: Landmark,
  },
  {
    title: "Reportes",
    url: "/dashboard/reports",
    icon: PieChart,
  },
  {
    title: "Oficinas",
    url: "/dashboard/office-configuration",
    icon: LampDesk,
  },
];

const ticketsItems = [
  {
    name: "Tickets",
    url: "/dashboard/tickets",
    icon: Ticket,
  },
  {
    name: "Chat con clientes",
    url: "/dashboard/chat",
    icon: MessagesSquare,
  },
];

const projectsItems = [
  {
    name: "Monitoreo pendientes",
    url: "/dashboard/web-monitoring",
    icon: CircleHelp,
  },
  {
    name: "Monitoreo de completados",
    url: "/dashboard/transfer-monitoring",
    icon: CircleHelp,
  },
];

const othersItems = [
  {
    name: "Recupero por WhatsApp",
    url: "/dashboard/whatsapp-recovery",
    icon: CircleHelp,
  },
  {
    name: "Descarga de cuentas",
    url: "/dashboard/download-accounts",
    icon: CircleHelp,
  },
  {
    name: "Historial landing web",
    url: "/dashboard/landing-history",
    icon: CircleHelp,
  },
];


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isOperator } = useAuth()

  const userData = useMemo(() => ({
    name: user?.name,
    email: user?.email
  }), [user?.name, user?.email]);

  const filteredItems = useMemo(() => {
    if (isOperator) {
      return {
        navMain: [],
        reports: [],
        tickets: ticketsItems,
        projects: [],
        others: []
      };
    }

    return {
      navMain: navMainItems,
      tickets: ticketsItems,
      projects: projectsItems,
      others: othersItems
    };
  }, [isOperator]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarContent>
        {filteredItems.navMain.length > 0 && (
          <NavMain items={filteredItems.navMain} />
        )}
        {filteredItems.tickets.length > 0 && (
          <NavProjects projects={filteredItems.tickets} title="Tickets" />
        )}
        {filteredItems.projects.length > 0 && (
          <NavProjects projects={filteredItems.projects} title="Monitoreos" />
        )}
        {filteredItems.others.length > 0 && (
          <NavProjects projects={filteredItems.others} title="Otros" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData as { name: string; email: string }} />
      </SidebarFooter>
    </Sidebar>
  )
}