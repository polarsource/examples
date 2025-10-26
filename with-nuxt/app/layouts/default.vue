<template>
  <div class="bg-background text-foreground font-sans">
    <header class="border-b border-border bg-card">
      <div class="container mx-auto px-4 py-4">
        <nav class="flex items-center justify-between">
          <NuxtLink to="/" class="text-2xl font-heading font-bold text-primary"> Polar with Nuxt Example </NuxtLink>
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="text-muted-foreground hover:text-foreground transition-colors border p-3"> Products </NuxtLink>
            <NuxtLink to="/customer-portal" class="text-muted-foreground hover:text-foreground transition-colors border p-3"> Customer Portal </NuxtLink>
          </div>
        </nav>
      </div>
    </header>
    <main class="min-h-screen">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts"></script>
