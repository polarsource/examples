'use client'

import config from '@/lib/config'
import { ModProduct } from '@/lib/types'
import { PolarEmbedCheckout } from '@polar-sh/checkout/embed'

export default function Product({ name, medias, checkoutLink }: ModProduct) {
  const openCheckout = () => {
    if (checkoutLink) {
      if (config.newTab) window.open(checkoutLink, '_blank')
      else PolarEmbedCheckout.create(checkoutLink, config.theme)
    }
  }
  return (
    <a
      onClick={openCheckout}
      target={config.newTab ? '_blank' : '_parent'}
      className={['lg:rounded-4xl rounded-lg border border-transparent bg-gray-50 p-4 flex w-full flex-col gap-y-4 pb-8', checkoutLink ? 'cursor-pointer' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {medias?.[0]?.publicUrl ? (
        <img src={medias[0].publicUrl} alt={name} className="h-[200px] w-auto object-contain border rounded-lg" />
      ) : (
        <div className="w-full h-[200px] border bg-gray-200 rounded-lg" />
      )}
      <span className="font-semibold text-lg">{name}</span>
    </a>
  )
}
