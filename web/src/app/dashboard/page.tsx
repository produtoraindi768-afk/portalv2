import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | SZ - Fortnite Ballistic",
}

export default function DashboardPage() {
  if (typeof window !== "undefined") {
    window.location.replace("/")
  }
  return null
}


