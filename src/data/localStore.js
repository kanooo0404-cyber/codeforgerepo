import { createInitialDemoState } from './demoSeed.js';

const STORAGE_KEY = 'foundit_demo_state_v1';
const SESSION_KEY = 'foundit_demo_session_uid';

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

let memoryFallback = null;

export function loadDemoState() {
  const storage = getStorage();
  if (!storage) {
    if (!memoryFallback) memoryFallback = createInitialDemoState();
    return memoryFallback;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialDemoState();
      storage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    const initial = createInitialDemoState();
    storage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

export function saveDemoState(nextState) {
  const storage = getStorage();
  if (!storage) {
    memoryFallback = nextState;
    return;
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function resetDemoState() {
  const fresh = createInitialDemoState();
  saveDemoState(fresh);
  return fresh;
}

export function getDemoSessionUid() {
  const storage = getStorage();
  return storage ? storage.getItem(SESSION_KEY) : null;
}

export function setDemoSessionUid(uid) {
  const storage = getStorage();
  if (!storage) return;
  if (uid) storage.setItem(SESSION_KEY, uid);
  else storage.removeItem(SESSION_KEY);
}
