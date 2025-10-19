import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import './globals.css'

export const metadata: Metadata = {
  title: 'شحناتي - نظام إدارة الشحن',
  description:
    'تطبيق شامل لإدارة الشحن',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
