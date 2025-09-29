import { Suspense } from "react"
import CommunicationHub from "@/components/communication-hub"

export default function CommunicationPage() {
  return (
    <div className="container mx-auto p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <CommunicationHub />
      </Suspense>
    </div>
  )
}
