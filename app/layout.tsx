import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import './globals.css'

export const metadata: Metadata = {
  title: 'ShipTest - Shipping Management for Testing Education',
  description:
    'A comprehensive shipping management application designed for teaching software testing concepts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
