FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install
CMD ["node", "backend/dist/server.js"]
EXPOSE 6060