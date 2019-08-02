export type EmitterEvent = { target: any; type: string; data: any[] };

export type Listener<T extends EmitterEvent> =
  | ((...data: T["data"]) => any)
  | ((this: T["target"], ...data: T["data"]) => any);

export type Target<T extends EmitterEvent> =
  | { on(event: T["type"], listener: Listener<T>): any }
  | { addListener(event: T["type"], listener: Listener<T>): any }
  | { addEventListener(event: T["type"], listener: Listener<T>): any };

export default function<T extends EmitterEvent = EmitterEvent>(
  ...specs: [Target<T["target"]>, T["type"][], string[]?][]
): Promise<T>;
