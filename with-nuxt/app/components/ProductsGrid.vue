<template>
  <section id="products" class="py-16">
    <div class="container mx-auto px-4">
      <div v-if="!products || products.length === 0" class="text-center">
        <p class="text-muted-foreground">No products available.</p>
      </div>
      <template v-else>
        <h2 class="text-3xl font-heading font-medium text-center mb-12">Products</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :id="product.id"
            :name="product.name"
            :description="product.description"
            :image="product.medias?.[0]?.publicUrl"
            :priceAmount="product.prices?.[0]?.priceAmount"
            :priceCurrency="product.prices?.[0]?.priceCurrency"
          />
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  products: Array,
})
</script>
