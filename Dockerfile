FROM node:22-alpine3.19 AS base

WORKDIR /usr/src/app
COPY . .

FROM base AS prod-deps
RUN apk add --no-cache git
RUN yarn install --prod --frozen-lockfile

FROM base AS build
RUN apk add --no-cache git
RUN yarn install --frozen-lockfile
RUN yarn build

FROM base
COPY --from=prod-deps /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/dist /usr/src/app/dist

EXPOSE 3000
CMD [ "node", "dist/main.js" ]
