import type { Metadata } from 'next'
import { Readex_Pro } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import './globals.css'

const readexPro = Readex_Pro({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-readex',
})

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
    <html lang="ar" dir="rtl" className={readexPro.variable}>
      <body className={`${readexPro.className} bg-grid-fade`}>
        <AuthProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
