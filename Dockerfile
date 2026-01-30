FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 7452

CMD ["npm", "run", "dev", "--", "-p", "7452"]
