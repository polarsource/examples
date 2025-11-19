export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const polarWebhookSecret = config.webhookSecret
  const webhooksHandler = Webhooks({
    webhookSecret: polarWebhookSecret,
    onPayload: async (payload) => {
      console.log(payload)
    },
  })
  return webhooksHandler(event)
})
