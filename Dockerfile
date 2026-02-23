FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/next-env.d.ts ./next-env.d.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json

EXPOSE 3000

CMD ["npm", "run", "start", "--", "-p", "3000", "-H", "0.0.0.0"]
