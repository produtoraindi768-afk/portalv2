export default function DashboardPage() {
  if (typeof window !== "undefined") {
    window.location.replace("/")
  }
  return null
}


