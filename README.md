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
docker build -t magi-blocks .
```

#### Run container
```sh
docker run -d --rm -p 8080:8080 --name=magi-blocks magi-blocks
```