FROM node:24-bullseye

WORKDIR /app

COPY package.json package-lock.json ./
COPY node_modules ./node_modules
COPY src ./src

EXPOSE 3000
CMD ["node", "src/index.js"]
