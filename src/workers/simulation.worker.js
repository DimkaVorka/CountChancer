import { simulate } from '../simulation/monteCarlo.js';
self.onmessage = ({ data }) => { const result = simulate(data.input, data.iterations || 100000, progress => self.postMessage({ type:'progress', value: progress })); self.postMessage({ type:'result', result }); };
