<template>
  <div>
    <ProductsGrid :products="products" />
  </div>
</template>

<script setup lang="ts">
const { data: products } = await useAsyncData('products', () => $fetch('/api/products'))
</script>
