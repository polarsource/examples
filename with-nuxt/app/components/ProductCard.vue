<template>
  <div class="bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow">
    <NuxtImg :src="image || '/placeholder.svg'" :alt="name" class="w-full h-48 object-cover" />
    <div class="p-6">
      <h3 class="text-xl font-heading font-semibold text-card-foreground mb-2">
        {{ name }}
      </h3>
      <p class="text-muted-foreground mb-4">{{ description }}</p>
      <div class="flex items-center justify-between">
        <span class="text-2xl font-medium text-primary">{{ formattedPrice }}</span>
        <button @click="buyNow" class="px-4 py-2 bg-gray-200 text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">Buy Now</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  id: string
  name: string
  description?: string | null
  image?: string | null
  priceAmount?: number
  priceCurrency?: string
}>()

const formattedPrice = computed(() =>
  props.priceAmount
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: props.priceCurrency || 'USD',
      }).format(props.priceAmount / 100)
    : '—',
)

const buyNow = () => {
  const customerId = sessionStorage.getItem('customerId')
  const customerEmail = sessionStorage.getItem('customerEmail')
  const customerName = sessionStorage.getItem('customerName')
  const url = new URL('/api/checkout', window.location.origin)

  url.searchParams.append('products', props.id)
  if (customerId) {
    url.searchParams.append('customerId', customerId)
  }
  if (customerEmail) {
    url.searchParams.append('customerEmail', customerEmail)
  }
  if (customerName) {
    url.searchParams.append('customerName', customerName)
  }
  window.location.href = url.toString()
}
</script>
