import { useSyncExternalStore } from 'react';

export type EventName =
  | 'episode_start'
  | 'episode_complete'
  | 'paywall_view'
  | 'unlock_option_selected'
  | 'unlock_success'
  | 'coin_purchase'
  | 'ad_reward_granted';

export type TrackedEvent = { name: EventName; at: number; props: Record<string, string | number | boolean> };

const MAX_EVENTS = 100;
let events: TrackedEvent[] = [];
const listeners = new Set<() => void>();

export function track(name: EventName, props: TrackedEvent['props'] = {}) {
  events = [{ name, at: Date.now(), props }, ...events].slice(0, MAX_EVENTS);
  if (__DEV__) console.log(`[track] ${name}`, props);
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useEvents = () => useSyncExternalStore(subscribe, () => events, () => events);
