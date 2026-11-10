const DB = 'countchancer-db', STORE = 'calculations', VERSION = 1;
function open() { return new Promise((resolve,reject) => { const r = indexedDB.open(DB, VERSION); r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath:'id' }); r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error); }); }
export async function listHistory() { try { const db=await open(); return new Promise((res,rej)=>{const r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>res(r.result.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));r.onerror=()=>rej(r.error);}); } catch { return []; } }
export async function saveHistory(record) { try { const db=await open(); const tx=db.transaction(STORE,'readwrite'); tx.objectStore(STORE).put(record); await new Promise(r=>tx.oncomplete=r); const all=await listHistory(); for(const old of all.slice(50)) await removeHistory(old.id); } catch {} }
export async function removeHistory(id) { try { const db=await open(); db.transaction(STORE,'readwrite').objectStore(STORE).delete(id); } catch {} }
export async function clearHistory() { try { const db=await open(); db.transaction(STORE,'readwrite').objectStore(STORE).clear(); } catch {} }
export async function getHistory(id) { const rows=await listHistory(); return rows.find(row=>row.id===id) ?? null; }
