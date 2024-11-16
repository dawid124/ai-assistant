FROM node:23.1-slim

WORKDIR /app

COPY package.json .

RUN npm install