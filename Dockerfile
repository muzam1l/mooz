FROM node:18-alpine as builder

ARG SOCKET_PORT=5005
ENV REACT_APP_SAME_ORIGIN_SOCKET_PORT=${SOCKET_PORT}

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false

COPY . .

RUN yarn build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

# Remove default nginx index page
# RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
