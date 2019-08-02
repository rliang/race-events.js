"use strict";

const r = require(".");

const emitters = [
  ["on", "off"],
  ["addListener", "removeListener"],
  ["addEventListener", "removeEventListener"]
].map(([on, off]) => [
  on,
  off,
  {
    listeners: {},
    [on](event, listener) {
      this.listeners[event].add(listener);
    },
    [off](event, listener) {
      this.listeners[event].delete(listener);
    },
    emit(event, ...data) {
      for (const listener of this.listeners[event]) listener(...data);
    }
  }
]);

beforeEach(() => {
  for (const [on, off, emitter] of emitters)
    emitter.listeners = { foo: new Set(), bar: new Set(), baz: new Set() };
});

describe.each(emitters)("%s-%s emitter", (on, off, emitter) => {
  test("cleanup", async () => {
    r([emitter, ["foo"]]);
    await expect(emitter.listeners.foo.size).toEqual(1);
    r([emitter, ["foo", "bar"], ["baz"]], [emitter, ["baz"]]);
    await expect(emitter.listeners.foo.size).toEqual(2);
    await expect(emitter.listeners.bar.size).toEqual(1);
    await expect(emitter.listeners.baz.size).toEqual(2);
    emitter.emit("foo");
    await expect(emitter.listeners.foo.size).toEqual(0);
    await expect(emitter.listeners.bar.size).toEqual(0);
    await expect(emitter.listeners.baz.size).toEqual(0);
  });
  test("event with no parameters", async () => {
    setImmediate(() => emitter.emit("foo"));
    await expect(r([emitter, ["foo"]])).resolves.toEqual({
      type: "foo",
      target: emitter,
      data: []
    });
  });
  test("event with multiple parameters", async () => {
    setImmediate(() => emitter.emit("foo", 1, "a", [], {}));
    await expect(r([emitter, ["foo"]])).resolves.toEqual({
      type: "foo",
      target: emitter,
      data: [1, "a", [], {}]
    });
  });
  test("reject events", async () => {
    setImmediate(() => emitter.emit("foo", 1, "a", [], {}));
    await expect(r([emitter, ["bar"], ["foo"]])).rejects.toEqual({
      type: "foo",
      target: emitter,
      data: [1, "a", [], {}]
    });
  });
});

describe("mixed emitters", () => {
  test("cleanup", async () => {
    const [a, b, c] = emitters.map(([on, off, emitter]) => emitter);
    r([a, ["foo"]], [b, ["foo", "bar"]], [c, [], ["baz"]]);
    await expect(a.listeners.foo.size).toEqual(1);
    await expect(b.listeners.foo.size).toEqual(1);
    await expect(b.listeners.bar.size).toEqual(1);
    await expect(c.listeners.baz.size).toEqual(1);
    b.emit("bar");
    await expect(a.listeners.foo.size).toEqual(0);
    await expect(b.listeners.foo.size).toEqual(0);
    await expect(b.listeners.bar.size).toEqual(0);
    await expect(c.listeners.baz.size).toEqual(0);
  });
});
