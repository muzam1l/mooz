# Vercel WebSocket feasibility demo

An isolated Socket.IO probe for [issue #19](https://github.com/muzam1l/mooz/issues/19). It tests the transport used by Mooz without changing the meeting app or its existing deployment.

## Deploy on your Hobby account

Import this repository into Vercel, select the demo branch, and set **Root Directory** to `demos/vercel-websocket`. Choose **Other** for the framework; leave the build command empty and use `public` as the output directory. Fluid compute and the 300-second duration are configured in `vercel.json`. No environment variables or external services are required.

Alternatively, check out the demo branch and run `npx vercel` from this directory, selecting your Hobby account. Do not deploy from the repository root.

Open the deployment in two tabs, send an echo in each, and compare the instance IDs. Leave both tabs open for more than five minutes, then send another echo. The log records disconnects and automatic reconnects. Use **Reconnect now** to test a fresh connection immediately. An instance ID can change on reconnect; matching IDs do not prove affinity is guaranteed.

Check Vercel's usage dashboard before and after a longer test. This demo reports connection behavior, not billing measurements. It has not been verified on a live Vercel deployment.

## Run locally

```sh
cd demos/vercel-websocket
npm ci
npm test
npm run dev
```

Visit `http://127.0.0.1:5006`. Local Node has no Vercel duration limit, so the five-minute timeout must be tested on Vercel. Tests cover two concurrent WebSocket clients, echo acknowledgements, manual and automatic reconnect, and delivery of the browser client script.

## Findings checked October 29, 2026

- Vercel announced [WebSocket general availability on October 20](https://vercel.com/changelog/websocket-support-is-now-generally-available). Its [WebSocket documentation](https://vercel.com/docs/functions/websockets) supports Socket.IO with the WebSocket transport on all plans.
- [Hobby](https://vercel.com/docs/plans/hobby) is free for personal, non-commercial use. Monthly allowances include 4 CPU hours, 360 GB-hours of provisioned memory, 1 million function invocations, 100 GB fast data transfer and 10 GB fast origin transfer. Exceeding allowances generally pauses the resource instead of buying overages.
- Under [Fluid pricing](https://vercel.com/docs/functions/usage-and-pricing), waiting avoids CPU charges but provisioned memory remains metered while requests are in flight. An open socket is not free of resource usage. At Hobby's 2 GB allocation, 360 GB-hours gives roughly **180 aggregate instance-hours**, assuming no other memory use. Concurrent sockets may share an instance; this is not a per-socket allowance or a guaranteed capacity estimate.
- [Hobby functions end after 300 seconds](https://vercel.com/docs/functions/limitations), including WebSocket connections. Socket.IO reconnects automatically, but application state must also survive and be restored.

## Impact on Mooz

The existing `server/index.ts` stores room records in `NodeCache` and uses Socket.IO's default in-memory adapter. Different function instances cannot see each other's rooms, members or signaling messages. A reconnect carrying `currentRoomId` can therefore reject a still-active meeting. Frontend `src/state/remote.ts` also currently starts with HTTP polling.

A reliable migration needs shared room storage plus a compatible cross-instance Socket.IO adapter, direct WebSocket transport, and room/session restoration across timeout and deployment reconnects. Merely exporting the current HTTP server as a Function is insufficient. External storage has its own limits and pricing, which this probe does not estimate.

Mooz sends media and chat through WebRTC peers; this server handles room coordination and signaling. Existing peers may keep communicating during a signaling outage, but joins and renegotiation still require a functioning signaling service. This probe tests that service's transport only; it does not demonstrate complete meetings on Vercel.
