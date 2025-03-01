'use client'

import { BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isLoading, isAuthenticated } = useAuth(true)
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="mr-2 h-12 w-12 animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <ModeToggle />
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
