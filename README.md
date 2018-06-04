# amdify

Super-easy AMD optimize-as-a-service service. [Try it now!](https://amdfiy.herokuapp.com/@searchfe/promise.js)

## Installation

```bash
yarn
PORT=8132 node app.js
```

## Usage

```
GET /@searchfe/promise.js
```

This will automatically install package `@searchfe/promise` via apmjs,
 optimize via require.js optimizer, and serve it via HTTP.


## Debug

```
DEBUG=amdify node app.js
```
