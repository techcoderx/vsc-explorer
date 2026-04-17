FROM node:22-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ARG VITE_NETWORK=mainnet
ENV VITE_NETWORK=$VITE_NETWORK

ARG VITE_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID_HERE
ENV VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID

ARG VITE_ETH_RPC=https://eth.llamarpc.com
ENV VITE_ETH_RPC=$VITE_ETH_RPC

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
COPY --from=build /app/dist/locales /html/locales/
COPY ./docker/nginx.conf /etc/nginx/conf.d/