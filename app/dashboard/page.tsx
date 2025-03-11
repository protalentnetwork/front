'use client'

import { redirect } from "next/navigation"
import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading) {
      // Redirect all users to chat page
      redirect("/dashboard/chat")
    }
  }, [isLoading])
  
  // Show nothing while determining where to redirect
  return null
}
