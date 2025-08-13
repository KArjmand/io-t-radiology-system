FROM node:18-alpine AS build

WORKDIR /usr/src/io-t-radiology-system

# Install yarn
RUN apk add --no-cache yarn

COPY package*.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install yarn
RUN apk add --no-cache yarn

WORKDIR /usr/src/io-t-radiology-system

COPY package*.json yarn.lock* ./

RUN yarn install --production

COPY --from=build /usr/src/io-t-radiology-system/dist ./dist
COPY --from=build /usr/src/io-t-radiology-system/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main"]
