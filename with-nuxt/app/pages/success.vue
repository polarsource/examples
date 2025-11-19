<template>
  <section class="pt-4 pb-16">
    <div class="container mx-auto px-4 text-center">
      <div v-if="checkout && product" class="max-w-2xl mx-auto">
        <!-- Success Icon -->
        <div class="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 class="text-4xl font-heading font-bold text-primary mb-4">Purchase Successful!</h1>
        <p class="text-xl text-muted-foreground mb-8">Thank you for your purchase. You now have access to:</p>
        <!-- Product Details -->
        <div class="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 class="text-2xl font-heading font-semibold text-card-foreground mb-2">
            {{ product.name }}
          </h2>
          <p class="text-muted-foreground mb-4">
            {{ product.description }}
          </p>
          <div class="text-lg font-semibold text-primary">Order ID: {{ checkout.id }}</div>
        </div>
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/customer-portal" class="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors">
            Access Customer Portal
          </NuxtLink>
          <NuxtLink to="/" class="px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/90 transition-colors"> Browse More Products </NuxtLink>
        </div>
      </div>
      <div v-else class="max-w-md mx-auto">
        <h1 class="text-3xl font-heading font-bold text-primary mb-4">Invalid Session</h1>
        <p class="text-muted-foreground mb-6">We couldn't find your purchase details. Please check your email for confirmation.</p>
        <NuxtLink to="/" class="inline-flex px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"> Return to Home </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const route = useRoute()
const checkoutId = route.query.checkoutId

// This needs to be fetched on the client
const { data } = await useAsyncData('checkout-details', () => $fetch(`/api/checkout-details?checkoutId=${checkoutId}`), {
  server: false,
})

const checkout = computed(() => data.value?.checkout)
const product = computed(() => data.value?.product)

onMounted(() => {
  const countdownElement = document.createElement('p')
  let countdown = 10
  countdownElement.className = 'text-sm text-muted-foreground mt-4'
  countdownElement.textContent = `Redirecting to dashboard in ${countdown} seconds...`
  document.querySelector('section > div')?.appendChild(countdownElement)
  const interval = setInterval(() => {
    countdown--
    countdownElement.textContent = `Redirecting to dashboard in ${countdown} seconds...`
    if (countdown <= 0) {
      clearInterval(interval)
      window.location.href = '/'
    }
  }, 1000)
})
</script>
