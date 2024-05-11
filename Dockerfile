FROM node:20-alpine
WORKDIR /app
COPY . .

ENV NODE_ENV=development
RUN yarn install

ENV NODE_ENV='production'
RUN yarn build

CMD ["yarn", "workspace backend start"]
EXPOSE 6060