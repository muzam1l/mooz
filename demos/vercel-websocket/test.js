import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { io as connect } from 'socket.io-client'
import server, { io, instanceId } from './api/socket.js'

test('WebSocket echo works for two clients and after reconnecting', { timeout: 10000 }, async t => {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const url = `http://127.0.0.1:${server.address().port}`
  const clients = []
  t.after(() => {
    clients.forEach(client => client.disconnect())
    return new Promise(resolve => io.close(resolve))
  })
  for (let index = 0; index < 2; index += 1) {
    const client = connect(url, {
      path: '/api/socket/socket.io',
      transports: ['websocket'],
      autoConnect: false,
    })
    clients.push(client)
    const greeting = once(client, 'instance')
    client.connect()
    assert.equal((await greeting)[0].instanceId, instanceId)
    assert.equal(client.io.engine.transport.name, 'websocket')
    assert.deepEqual(await client.timeout(2000).emitWithAck('echo', 'hello'), {
      message: 'hello', instanceId,
    })
  }
  const client = clients[0]
  const oldId = client.id
  client.disconnect()
  const reconnected = once(client, 'connect')
  client.connect()
  await reconnected
  assert.notEqual(client.id, oldId)
  assert.equal((await client.timeout(2000).emitWithAck('echo', 'again')).message, 'again')
  // An interrupted transport should trigger Socket.IO's automatic reconnect.
  const automaticReconnect = once(client, 'connect')
  client.io.engine.close()
  await automaticReconnect
  assert.equal((await client.timeout(2000).emitWithAck('echo', 'automatic')).message, 'automatic')
  const script = await fetch(`${url}/api/socket/socket.io/socket.io.js`)
  assert.equal(script.status, 200)
  assert.match(await script.text(), /Socket.IO/)
})
