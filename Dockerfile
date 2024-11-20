FROM node:23.1-slim

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm install -g ts-node
RUN npm install -g bun
#CMD [ "npm", "run", "/src/app.ts"]