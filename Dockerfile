FROM node:24-bullseye

WORKDIR /app

COPY package.json package-lock.json ./

COPY node_modules ./node_modules

EXPOSE 3001
CMD ["npm", "start"]
