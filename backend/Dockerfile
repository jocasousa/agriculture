FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 
RUN apt-get update && apt-get install -y postgresql-client


EXPOSE 3002

CMD ["npm", "run", "start:prod"]
