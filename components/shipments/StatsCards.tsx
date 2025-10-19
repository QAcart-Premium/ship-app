interface StatsCardsProps {
  total: number
  draft: number
  finalized: number
}

export default function StatsCards({ total, draft, finalized }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-600">إجمالي الشحنات</div>
        <div className="text-2xl font-bold text-gray-900">{total}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-600">مسودة</div>
        <div className="text-2xl font-bold text-gray-500">{draft}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-600">مُكتمل</div>
        <div className="text-2xl font-bold text-green-600">{finalized}</div>
      </div>
    </div>
  )
}
