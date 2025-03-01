'use client'

import { redirect } from "next/navigation"
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { isOperator, isManager, isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading) {
      if (isOperator) {
        redirect("/dashboard/tickets")
      } else if (isManager) {
        redirect("/dashboard/web-monitoring")
      } else {
        redirect("/dashboard/users")
      }
    }
  }, [isOperator, isManager, isLoading])
  
  // Show nothing while determining where to redirect
  return null
}
