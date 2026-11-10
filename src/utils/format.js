export const pct = n => `${(n * 100).toFixed(2)}%`;
export const num = n => new Intl.NumberFormat('ru-RU').format(Math.round(n));
export function fraction(value) { if (!value) return '0/1'; let best=[0,1], err=Infinity; for(let d=1;d<=100;d++){const a=Math.round(value*d),e=Math.abs(value-a/d);if(e<err){best=[a,d];err=e;}} const g=(a,b)=>b?g(b,a%b):a, div=g(best[0],best[1]); return `${best[0]/div}/${best[1]/div}`; }
