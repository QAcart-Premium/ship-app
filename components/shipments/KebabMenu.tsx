import Link from 'next/link'
import { Edit, Eye, Trash2, FileCheck, Copy } from 'lucide-react'

interface KebabMenuProps {
  shipmentId: number
  status: string
  position: { top: number; left: number }
  onClose: () => void
  onDelete: (id: number) => void
}

export default function KebabMenu({
  shipmentId,
  status,
  position,
  onClose,
  onDelete,
}: KebabMenuProps) {
  return (
    <div
      className="fixed w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="py-1">
        {status === 'draft' ? (
          <>
            <Link
              href={`/shipments/${shipmentId}`}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              onClick={onClose}
            >
              <Eye className="w-4 h-4" />
              View
            </Link>
            <Link
              href={`/?edit=${shipmentId}`}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              onClick={onClose}
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <Link
              href={`/shipments/${shipmentId}`}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              onClick={onClose}
            >
              <FileCheck className="w-4 h-4" />
              Finalize
            </Link>
            <button
              onClick={() => onDelete(shipmentId)}
              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/shipments/${shipmentId}`}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              onClick={onClose}
            >
              <Eye className="w-4 h-4" />
              View
            </Link>
            <Link
              href={`/?repeat=${shipmentId}`}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              onClick={onClose}
            >
              <Copy className="w-4 h-4" />
              Repeat
            </Link>
            <button
              onClick={() => onDelete(shipmentId)}
              className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}
