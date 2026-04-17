FROM node:18-alpine

WORKDIR /app

# install dependencies first (layer caching)
COPY package*.json ./
RUN npm install

# copy source
COPY . .

# build typescript
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]