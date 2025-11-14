# Stage 1: Builder
FROM node:22-bullseye AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --workspaces --omit=dev

COPY . .

RUN npm run build --workspaces


# Stage 2: Runner
FROM node:22-bullseye

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD [ "npm", "start" ]