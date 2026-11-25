const DB_NAME = 'ProfeListoLocalDB';
const DB_VERSION = 1;
const STORE_NAME = 'kv_store';
const LS_PROGRESS_KEY = 'profelisto_progress_v2';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbSet(key, value) {
  try {
    const db = await openDatabase();
    if (!db) {
      localStorage.setItem(`idb_fallback_${key}`, JSON.stringify(value));
      return;
    }
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Fallback a localStorage para:', key, err);
    try {
      localStorage.setItem(`idb_fallback_${key}`, JSON.stringify(value));
    } catch {
      // Ignorar si supera cuota
    }
  }
}

export async function idbGet(key) {
  try {
    const db = await openDatabase();
    if (!db) {
      const raw = localStorage.getItem(`idb_fallback_${key}`);
      return raw ? JSON.parse(raw) : null;
    }
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const raw = localStorage.getItem(`idb_fallback_${key}`);
    return raw ? JSON.parse(raw) : null;
  }
}

export async function idbDelete(key) {
  try {
    const db = await openDatabase();
    if (db) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  } catch {
    // Silencioso
  }
  localStorage.removeItem(`idb_fallback_${key}`);
}

export const DEFAULT_PROGRESS = {
  screen: 'upload', // 'upload' | 'avatar' | 'map' | 'quiz'
  avatarId: 'mateo',
  streak: 1,
  xp: 0,
  currentLevelIndex: 0,
  unlockedLevelIndex: 0,
  lastCheckpointIndex: 0,
  completedLevels: [],
  earnedBadges: [],
  currentHints: 5,
  maxHintsPerLevel: 5,
  soundEnabled: true,
  generationCount: 1,
  usedFingerprints: [],
};

export function loadProgressSync() {
  try {
    const raw = localStorage.getItem(LS_PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgressSync(progress) {
  try {
    localStorage.setItem(LS_PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('No se pudo guardar el progreso en localStorage:', err);
  }
}

export async function saveUploadedDocs(docsBundle) {
  await idbSet('uploaded_docs_v2', docsBundle);
}

export async function loadUploadedDocs() {
  return await idbGet('uploaded_docs_v2');
}

export async function clearUploadedDocs() {
  await idbDelete('uploaded_docs_v2');
}

export async function saveCampaignData(campaign) {
  await idbSet('active_campaign_v2', campaign);
}

export async function loadCampaignData() {
  return await idbGet('active_campaign_v2');
}

export async function clearCampaignData() {
  await idbDelete('active_campaign_v2');
}
