FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN apk add --no-cache git
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 3000
CMD [ "node", "dist/main.js" ]