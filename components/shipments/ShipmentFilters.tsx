interface ShipmentFiltersProps {
  statusFilter: string
  typeFilter: string
  onStatusChange: (value: string) => void
  onTypeChange: (value: string) => void
}

export default function ShipmentFilters({
  statusFilter,
  typeFilter,
  onStatusChange,
  onTypeChange,
}: ShipmentFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الحالة
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="finalized">مُكتمل</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            النوع
          </label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الأنواع</option>
            <option value="Domestic">محلي</option>
            <option value="IntraGulf">خليجي</option>
            <option value="International">دولي</option>
          </select>
        </div>
      </div>
    </div>
  )
}
