import { type Product as TypeProduct } from '@polar-sh/sdk/models/components/product.js'

export type ModProduct = TypeProduct & { checkoutLink?: string }
