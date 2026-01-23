"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Hospital {
  _id: string
  name: string
  email: string
  address?: string
  phone?: string
}

export function HospitalsSection({ onSelectHospital }: { onSelectHospital: (id: string) => void }) {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getHospitals()
        setHospitals(response.data || response)
        setError("")
      } catch (err: any) {
        setError("Failed to load hospitals")
        console.error("Error fetching hospitals:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hospitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading hospitals...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id="hospitals">
      <CardHeader>
        <CardTitle>Hospitals</CardTitle>
        <CardDescription>Select a hospital to manage its admins</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.length > 0 ? (
            hospitals.map((hospital) => (
              <div
                key={hospital._id}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition"
                onClick={() => onSelectHospital(hospital._id)}
              >
                <h3 className="font-semibold text-foreground mb-1">{hospital.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{hospital.email}</p>
                {hospital.address && <p className="text-xs text-muted-foreground">{hospital.address}</p>}
                <Button
                  size="sm"
                  variant="default"
                  className="mt-3 w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectHospital(hospital._id)
                  }}
                >
                  Manage Admins
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">No hospitals found</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
