FROM node:14-alpine
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production=false

COPY . .

RUN npm run build

EXPOSE $PORT

CMD ["npm", "run", "start"]
