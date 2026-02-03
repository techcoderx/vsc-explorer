FROM node:22-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG VITE_NETWORK=mainnet
ENV VITE_NETWORK=$VITE_NETWORK
RUN npm i -g corepack@latest
RUN corepack enable
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
RUN mkdir -p /html
COPY --from=build /app/dist/index.html /html/
COPY --from=build /app/dist/assets /html/assets/
COPY --from=build /app/dist/img /html/img/
COPY ./docker/nginx.conf /etc/nginx/conf.d/