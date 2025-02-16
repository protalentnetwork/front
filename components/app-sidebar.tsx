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

const data = {
  user: {
    name: "admin",
    email: "admin@admin.com",
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      {/* <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader> */}
      <SidebarContent>
        <NavMain items={data.navMain} />
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
