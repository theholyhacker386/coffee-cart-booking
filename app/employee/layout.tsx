import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Employee Portal | The Porch Coffee Bar',
  description: 'Employee portal for The Porch Coffee Bar',
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      {children}
    </div>
  )
}
