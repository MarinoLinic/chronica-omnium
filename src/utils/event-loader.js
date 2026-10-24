import { prepareImage } from "./images.js";
import { resolveDates } from "./dates.js";

// Share intent preloads and navigations. Keep the cache bounded during long visits.
export function createEventLoader({ fetcher = (...args) => fetch(...args), prepare = prepareImage, limit = 24 } = {}) {
  const cache = new Map();
  function loadEvent(id) {
    if (cache.has(id)) {
      const entry = cache.get(id);
      cache.delete(id);
      cache.set(id, entry);
      return entry;
    }
    const signal = new AbortController().signal;
    const promise = fetcher(`/data/events/${id}.json`)
      .then(response => {
        if (!response.ok) throw new Error("Cached article could not be loaded.");
        return response.json();
      })
      .then(async record => ({ id, event: await prepare(resolveDates(record), signal), content: record.content }))
      .catch(error => {
        if (cache.get(id) === promise) cache.delete(id);
        throw error;
      });
    cache.set(id, promise);
    if (cache.size > limit) cache.delete(cache.keys().next().value);
    return promise;
  }
  loadEvent.clear = () => cache.clear();
  return loadEvent;
}
export const loadEvent = createEventLoader();
let route;
export const loadEventRoute = () => route ||= import("../components/Event.jsx");
export function preloadEvent(id) {
  // Save-data users still preload when they actually navigate.
  if (navigator.connection?.saveData) return;
  loadEventRoute().catch(() => { route = undefined; });
  loadEvent(id).catch(() => {});
}
