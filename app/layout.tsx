import type { Metadata } from 'next'
import Link from 'next/link'
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
  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

  return (
    <html lang="en">
      <body>
        {/* Header Navigation */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Title */}
              <div className="flex items-center space-x-2">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <span className="text-xl font-bold text-gray-900">
                  ShipTest
                </span>
                {isTestMode && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    TEST MODE
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              ShipTest - Built for Software Testing Education
              {isTestMode && (
                <span className="ml-2 text-xs">
                  (Test Mode: data-testid attributes enabled, validation rules
                  visible)
                </span>
              )}
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
