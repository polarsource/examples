import { Link } from 'react-router'

type ProductCardProps = {
  id: string
  name: string
  description?: string | null
  image?: string | null
  priceAmount?: number
  priceCurrency?: string
}

export function ProductCard(props: ProductCardProps) {
  const formattedPrice = props.priceAmount
    ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: props.priceCurrency || 'USD',
    }).format(props.priceAmount / 100)
    : '—'

  const checkoutHref = `/polar/checkout?products=${encodeURIComponent(props.id)}`

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden rounded-lg hover:shadow-lg transition-shadow">
      <img src={props.image || '/placeholder.svg'} alt={props.name} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{props.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{props.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-medium">{formattedPrice}</span>
          <Link to={checkoutHref} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  )
}
