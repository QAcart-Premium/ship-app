import ShipmentForm from '@/components/ShipmentForm'

export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title">
          Create New Shipment
        </h1>
        <p className="text-gray-600">
          Fill in the shipment details below
        </p>
      </div>
      <ShipmentForm />
    </div>
  )
}
