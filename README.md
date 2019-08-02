# race-events.js
[![npm](https://img.shields.io/npm/v/race-events.svg)](https://www.npmjs.org/package/race-events)
[![size](https://img.shields.io/bundlephobia/minzip/race-events.svg)](https://bundlephobia.com)
[![deps](https://david-dm.org/rliang/race-events/status.svg)](https://david-dm.org/rliang/race-events)

Race event emissions from a set of emitters and events.

- Supports Node's `EventEmitter` and browser's `EventTarget`
- Supports Typescript

## Installation

```sh
npm i race-events
```

## API

```ts
raceEvents(...specs: [Emitter, ResolveEventName[], RejectEventName[]?][]):
  Promise<{ target: Emitter, type: ResolveEventName, data: any[] }>
```

## Usage

```ts
import r from "race-events";
import WebSocket from "ws";

type WSMessage = { target: WebSocket; type: "message"; data: [WebSocket.Data] };
type WSClose = { target: WebSocket; type: "close"; data: [number, string] };
type WSError = { target: WebSocket; type: "error"; data: [Error] };

const wss = new WebSocket.Server();

wss.on("connection", async function(ws) {
  try {

    // await messages, throw close and error events
    let a = await r<WSMessage>([ws, ["message"], ["close", "error"]]);
    console.log(a.type, a.target, a.data);

    // do not throw close and error events
    let b = await r<WSMessage | WSClose | WSError>([ws, ["message", "close", "error"]]);

  } catch (e) {
    console.error("threw", e);
  }
});
```

## Related libraries

- [ee-first](https://www.npmjs.com/package/ee-first)
- [await-first](https://www.npmjs.com/package/await-first)
- [first-event](https://www.npmjs.com/package/first-event)
- [event-race](https://www.npmjs.com/package/event-race)
