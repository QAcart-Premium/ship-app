import { Trash2 } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean
  shipmentId: number | null
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteModal({
  isOpen,
  shipmentId,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-muted rounded-lg shadow-xl max-w-md w-full mx-4 border border-border">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-nord-aurora-red/20 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">حذف الشحنة</h3>
              <p className="text-sm text-muted-foreground">شحنة رقم #{shipmentId}</p>
            </div>
          </div>
          <p className="text-muted-foreground mb-6">
            هل أنت متأكد من رغبتك في حذف هذه الشحنة؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-muted-foreground bg-nord-polar-2 border border-border rounded-md hover:bg-nord-polar-3 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-destructive rounded-md hover:bg-nord-aurora-red/80 transition-colors"
            >
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
