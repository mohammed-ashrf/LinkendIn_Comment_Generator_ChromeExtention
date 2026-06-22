type ResponseHandler = (data: any) => void;
type EventHandler = (data: any) => void;

const pending = new Map<string, ResponseHandler>();
const listeners = new Map<string, Set<EventHandler>>();
let counter = 0;

export const bridge = {
  send(type: string, data: Record<string, unknown> = {}): Promise<any> {
    return new Promise((resolve) => {
      const id = `msg_${++counter}`;
      pending.set(id, resolve);
      window.parent.postMessage({ id, type, ...data }, "*");
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          resolve(undefined);
        }
      }, 8000);
    });
  },

  on(type: string, handler: EventHandler) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(handler);
    return () => { listeners.get(type)?.delete(handler); };
  },

  init() {
    window.addEventListener("message", (e) => {
      if (e.data.source !== "extension") return;
      const { id, type, ...rest } = e.data;
      if (id && pending.has(id)) {
        pending.get(id)!(rest);
        pending.delete(id);
      } else if (type && listeners.has(type)) {
        listeners.get(type)!.forEach((fn) => fn(rest));
      }
    });
  },
};
