import handler from './index.js'
import { createServer } from 'node:http'

const PORT = process.env.PORT || 3000

const server = createServer(async (req, res) => {
  try {
    // Convert Node.js request to Web Request
    const url = `http://${req.headers.host || `localhost:${PORT}`}${req.url}`
    // Get request body for POST requests
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    const body = Buffer.concat(chunks)
    
    // Create Web Request
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: body.length > 0 ? body : undefined,
    })
    
    // Call the handler
    const response = await handler.fetch(request)
    
    // Convert Web Response to Node.js response
    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      res.setHeader(key, value)
    })
    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }
    res.end()
  } catch (error) {
    console.error('Server error:', error)
    res.statusCode = 500
    res.end(error.message)
  }
})

server.listen(PORT)
