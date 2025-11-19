<template>
  <section class="py-16">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto text-center">
        <h1 class="text-4xl font-heading font-bold text-primary mb-6">Customer Portal</h1>
        <p class="text-xl text-muted-foreground mb-8">Access your purchases and manage your account</p>

        <div class="bg-card border border-border rounded-lg p-6">
          <form @submit.prevent="accessPortal" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-card-foreground mb-2"> Enter your email address </label>
              <input
                type="email"
                id="email"
                v-model="email"
                class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                placeholder="your@email.com"
              />
            </div>
            <button type="submit" class="w-full px-6 py-3 bg-gray-200 text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
              Access Portal
            </button>
          </form>

          <p class="text-sm text-muted-foreground mt-4">You'll be redirected to your secure customer portal</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const email = ref('')

onMounted(() => {
  email.value = sessionStorage.getItem('customerEmail') || ''
})

const accessPortal = () => {
  const customerId = sessionStorage.getItem('customerId')
  sessionStorage.setItem('customerEmail', email.value)
  if (customerId) {
    window.location.href = `/api/customer-portal?customerId=${customerId}`
  } else if (email.value) {
    window.location.href = `/api/customer-portal?customerEmail=${email.value}`
  } else {
    alert('Please provide an email address to access the portal.')
  }
}
</script>
