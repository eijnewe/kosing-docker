"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"

export function useBankData<T>(path: string, method: "GET" | "POST") {
  const router = useRouter()
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      const token = sessionStorage.getItem("token")
      if (!token) {
        router.replace("/login")
        return
      }

      try {
        const response = await fetch(`${apiURL}${path}`, {
          method,
          headers: method === "GET"
            ? { Authorization: `Bearer ${token}` }
            : { "Content-Type": "application/json" },
          body: method === "POST" ? JSON.stringify({ token }) : undefined,
          signal: controller.signal,
        })

        if (response.status === 401) {
          sessionStorage.removeItem("token")
          router.replace("/login")
          return
        }
        if (!response.ok) throw new Error()
        setData(await response.json())
      } catch {
        if (!controller.signal.aborted) setError("Kunde inte hämta uppgifterna. Försök ladda om sidan.")
      }
    }

    void load()
    return () => controller.abort()
  }, [method, path, router])

  return { data, setData, error }
}
