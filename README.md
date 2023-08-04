# Mooz

Create or join a peer-to-peer meeting instantly. Supports audio, video, screen-share and chat all going through the p2p mesh network which is guaranteed to be of fully-connected type.

https://github.com/muzam1l/mooz/assets/52374648/d86b7e0c-c173-40ce-bd87-4e78161a1053

<p align="center">
    <a href="https://mooz.muzam1l.com">mooz.muzam1l.com</a>
</p>

# Libs

- `Angular` ah just kidding, always `React`!
- `Zustand` for state management, love the flexibility and my hair!
- `Fluentui` for UI components and this Microsofty look!
- `SocketIO` on the server side for signaling and room management. Any erroring node in the room mesh network is terminated appropriately, ensuring a fully-connected mesh network while tolerating some network failures and reconnects.

# Goals

Being an open source peer-to-peer video conferencing core app, easily deployable, extentable and customizable for custom use cases.

This could serve as a base app for any derived work, implementing features like these on top of it:

- Large File sharing.
- Session recording.
- End-to-end encryption.
- Collaborative whiteboard.
- Admin controls.

# Limitations

It scales very well in terms of how many rooms can be on server as it is a peer to peer solution. However there is a huge natural limitation on how many participants can be in one single room due to bandwidth and processing requirements of a fully-connected mesh network. As each node sends and receives data from every other node in the room, the bandwidth and processing requirements grow substantially with large number of participants in the room.

# Why node-cache instead of database?

Works for now!

TODO migrate to redis adapter.

# Building

## Docker

There are two `Dockerfile`'s in `<project_root>` and `<project_root>/server` and a `docker-compose.yml` file in `<project_root>`. Just run:

```sh
docker-compose up
```

And head over to localhost! If you want to use same setup in production environment, you will need to have this running behind ssl, load-balancer and stuff!

## Manual

### Install

- `yarn` to to install dependencies. 

- `yarn dev` to start development webpack server.

- `yarn build` to format, lint and build front-end.

[cd `server`]

- `npm install` to install dependencies.

- `npm run dev` to start development server with nodemon (install globally).

- `npm run build` to transpile Typescript files to JavaScript.

- `npm run start` to start production server.

# More

Still reading? Get a life dude!
