// server/routes/webhook/polar.post.ts
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const polarWebhookSecret = config.polarWebhookSecret
  const webhooksHandler = Webhooks({
    webhookSecret: polarWebhookSecret,
    onPayload: async (payload) => {
      // Handle the payload
      // No need to return an acknowledge response
    },
  })

  return webhooksHandler(event)
})
