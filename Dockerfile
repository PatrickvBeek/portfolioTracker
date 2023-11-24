FROM node:18-alpine
WORKDIR /app
COPY . .
RUN cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build
CMD ["node", "backend/dist/server.js"]
EXPOSE 6060