# Magi Explorer

Block explorer for [Magi](https://magi.eco), a Hive L2 smart contract platform.

## Required Dependencies

* [pnpm](https://pnpm.io/installation)
* `nodejs` (Latest LTS)

## Setup

#### Installation
```
git clone https://github.com/techcoderx/vsc-explorer
cd vsc-explorer
pnpm i
```

#### Start development server
```
pnpm start
```

## Build

#### Create minified build
```
pnpm run build
```
The resulting files can be found in `dist` folder.

#### Test minified build
```
pnpm run preview
```

## Dockerized setup

#### Build image
```sh
docker build --build-arg VITE_NETWORK=mainnet -t magi-blocks .
```

#### Run container
```sh
docker run -d --rm -p 8080:8080 --name=magi-blocks magi-blocks
```

## Build time env vars

* `VITE_NETWORK`: Network name (mainnet or testnet)

## Social preview renderer

Because the app is a SPA, link-preview crawlers (Discord, Twitter, Slack, etc.) don't execute
JavaScript and therefore can't read per-page Open Graph meta tags set by `react-helmet-async`.
The nginx container detects preview-bot User-Agents and proxies those requests to the backend's
`/og` scope (`magi-bb:8080/og/...`), which renders per-path meta-tag HTML. All other traffic
continues to receive the SPA. Enable and configure it in the backend's `[og]` config section.