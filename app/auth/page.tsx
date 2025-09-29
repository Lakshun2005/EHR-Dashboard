"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const router = useRouter()

  const handleDemoLogin = () => {
    router.push("/")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">HealthCare EHR</CardTitle>
          <CardDescription>Demonstration Access</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleDemoLogin}>
            Enter Demo Dashboard
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            This is a demo application. Authentication has been bypassed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}