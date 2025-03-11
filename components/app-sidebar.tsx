"use client"

import * as React from "react"
import { useMemo } from "react"
import {
  CircleCheckBig,
  CircleHelp,
  Hourglass,
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
import { NavSecondary } from "./nav-secondary"

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
    title: "Chat con clientes",
    url: "/dashboard/chat",
    icon: MessagesSquare,
  },
  {
    title: "Tickets",
    url: "/dashboard/tickets",
    icon: Ticket,
  },
];

const projectsItems = [
  {
    title: "Monitoreo pendientes",
    url: "/dashboard/web-monitoring",
    icon: Hourglass,
  },
  {
    title: "Monitoreo de completados",
    url: "/dashboard/transfer-monitoring",
    icon: CircleCheckBig,
  },
];


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isOperator, isManager } = useAuth()

  const userData = useMemo(() => ({
    name: user?.name,
    email: user?.email
  }), [user?.name, user?.email]);

  const filteredItems = useMemo(() => {
    if (isOperator) {
      return {
        navMain: [
          {
            title: "Usuarios",
            url: "/dashboard/users",
            icon: Users,
            isActive: true,
          }
        ],
        tickets: ticketsItems,
        projects: projectsItems,
        others: []
      };
    }

    if (isManager) {
      return {
        navMain: [
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
        ],
        tickets: ticketsItems,
        projects: projectsItems,
      };
    }

    // Para admin y otros roles
    return {
      navMain: navMainItems,
      tickets: ticketsItems,
      projects: projectsItems,
    };
  }, [isOperator, isManager]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarContent>
        {filteredItems.navMain.length > 0 && (
          <NavMain items={filteredItems.navMain} blockTitle="General" />
        )}
        {filteredItems.tickets.length > 0 && (
          <NavMain items={filteredItems.tickets} blockTitle="Tickets" />
        )}
        {filteredItems.projects.length > 0 && (
          <NavMain items={filteredItems.projects} blockTitle="Monitoreos" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData as { name: string; email: string }} />
      </SidebarFooter>
    </Sidebar>
  )
}