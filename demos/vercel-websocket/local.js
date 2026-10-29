import { readFileSync } from 'node:fs'
import server from './api/socket.js'

// Match Vercel's static / page and function /api/socket route locally.
const html = readFileSync(new URL('./public/index.html', import.meta.url))
const apiRequest = server.listeners('request')[0]
server.removeAllListeners('request')
server.on('request', (request, response) => {
  if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(html)
  } else {
    apiRequest.call(server, request, response)
  }
})
server.listen(Number(process.env.PORT || 5006), '127.0.0.1', () => {
  console.log(`Demo: http://127.0.0.1:${server.address().port}`)
})
