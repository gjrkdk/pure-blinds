import DimensionConfigurator from '@/components/dimension-configurator'

export default async function ProductPage({
  params
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params

  // Mock product data - real Shopify product fetching comes later
  const product = {
    id: productId,
    name: "Custom Textile",
    description: "Premium custom-dimension textile. Enter your desired width and height to get an instant price quote."
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <p className="text-gray-600 mb-8">{product.description}</p>

      <DimensionConfigurator productId={productId} productName={product.name} />
    </div>
  )
}
