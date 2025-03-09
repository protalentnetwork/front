'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function usePasswordVerification() {
  const { data: session } = useSession()
  const [verificationState, setVerificationState] = useState<Record<string, boolean>>({})
  const [verifyingField, setVerifyingField] = useState<string | null>(null)

  const startVerification = (fieldName: string) => {
    setVerifyingField(fieldName)
  }

  const cancelVerification = () => {
    setVerifyingField(null)
  }

  const handleVerificationResult = (fieldName: string, success: boolean) => {
    if (success) {
      setVerificationState(prev => ({
        ...prev,
        [fieldName]: true
      }))
    }
    setVerifyingField(null)
  }

  const isFieldVerified = (fieldName: string) => {
    return !!verificationState[fieldName]
  }

  return {
    verifyingField,
    startVerification,
    cancelVerification,
    handleVerificationResult,
    isFieldVerified,
    userEmail: session?.user?.email || ''
  }
} 