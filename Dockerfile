FROM node:current-alpine

WORKDIR /Users/nickboyd/dev/mtech/projects/deployment/docker

COPY . .

RUN npm install

EXPOSE 4002

CMD ["npm", "run", "start"]