import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { Server } from 'socket.io'

export const instanceId = randomUUID()
const server = createServer((request, response) => {
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify({ instanceId }))
})

export const io = new Server(server, {
  path: '/api/socket/socket.io',
  transports: ['websocket'],
  maxHttpBufferSize: 4096,
})

io.on('connection', socket => {
  socket.emit('instance', { instanceId, connectedAt: new Date().toISOString() })
  socket.on('echo', (message, acknowledge) => {
    if (typeof message === 'string' && typeof acknowledge === 'function') {
      acknowledge({ message: message.slice(0, 1000), instanceId })
    }
  })
})

export default server
