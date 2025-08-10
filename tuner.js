// UI elements
const targetSel = document.getElementById('target');
const activeTarget = document.getElementById('activeTarget');
const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle');
const needle = document.getElementById('needle');
const noteEl = document.getElementById('note');
const freqEl = document.getElementById('freq');
const centsEl = document.getElementById('cents');
const scaleEl = document.getElementById('scale');

// Build ticks
for (let c = -50; c <= 50; c += 10) {
  const div = document.createElement('div');
  div.className = 'tick ' + (c % 20 === 0 ? 'major' : 'minor') + (c === 0 ? ' zero' : '');
  scaleEl.appendChild(div);
}

function setStatus(msg) { statusEl.textContent = msg; }
function setActiveLabel(t) { activeTarget.textContent = `Target: ${t}`; }

// Constants
const STRINGS = { G3:196.00, D4:293.66, A4:440.00, E5:659.25 };
const NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const MIN_F = 80, MAX_F = 1000;

let audioCtx = null, analyser = null, src = null, stream = null, rafId = null, ema = 0;

toggleBtn.addEventListener('click', async () => {
  if (!audioCtx) {
    try { await startAudio(); toggleBtn.textContent = 'Stop'; } catch (e) { setStatus('Mic error: ' + e.message); }
  } else { stopAudio(); toggleBtn.textContent = 'Start'; }
});

targetSel.addEventListener('change', () => {
  const v = targetSel.value;
  setActiveLabel(v === 'auto' ? 'Auto' : `${v} – ${STRINGS[v].toFixed(2)} Hz`);
});

async function startAudio() {
  setStatus('Requesting microphone…');
  stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation:false, noiseSuppression:false, autoGainControl:false }, video:false });
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  src = audioCtx.createMediaStreamSource(stream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 4096; // 2048-sample buffer
  src.connect(analyser);
  setStatus('Listening…');
  loop();
}

function stopAudio() {
  cancelAnimationFrame(rafId); rafId = null;
  if (src) src.disconnect(); if (analyser) analyser.disconnect();
  if (stream) stream.getTracks().forEach(t => t.stop());
  if (audioCtx) audioCtx.close();
  audioCtx = analyser = src = stream = null;
  setStatus('Stopped');
  noteEl.textContent = '—'; freqEl.textContent = '— Hz'; centsEl.textContent = '—';
  needle.style.transform = `translateX(-50%) rotate(0deg)`;
}

function loop() {
  const buf = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buf);
  const f0 = estimatePitchACF(buf, audioCtx.sampleRate);
  if (f0) { ema = ema ? 0.25 * f0 + 0.75 * ema : f0; updateUI(ema); }
  rafId = requestAnimationFrame(loop);
}

function updateUI(freq) {
  let tgtName = targetSel.value;
  if (tgtName === 'auto') {
    let bestK = null, bestName = 'A4';
    for (const [name, F] of Object.entries(STRINGS)) {
      const cents = 1200 * Math.log2(freq / F);
      const k = Math.abs(cents);
      if (bestK === null || k < bestK) { bestK = k; bestName = name; }
    }
    tgtName = bestName; setActiveLabel(`Auto → ${tgtName}`);
  }
  const tgt = STRINGS[tgtName];
  const cents = 1200 * Math.log2(freq / tgt);
  const clamped = Math.max(-50, Math.min(50, cents));
  const deg = (clamped / 50) * 45;
  const note = noteName(freq);
  noteEl.textContent = note;
  freqEl.textContent = `${freq.toFixed(freq < 100 ? 2 : 1)} Hz`;
  centsEl.textContent = Math.abs(clamped) < 1 ? 'In tune' : `${clamped > 0 ? 'Sharp' : 'Flat'} ${Math.abs(clamped).toFixed(1)}¢`;
  centsEl.style.color = Math.abs(clamped) < 3 ? 'var(--ok)' : (Math.abs(clamped) < 10 ? 'var(--warn)' : 'var(--bad)');
  needle.style.transform = `translateX(-50%) rotate(${deg}deg)`;
}

// DSP: Autocorrelation (time-domain) with simple high-pass and Hann window
function estimatePitchACF(input, sampleRate) {
  // High-pass (one-pole)
  const cutoff = 70; const rc = 1 / (2 * Math.PI * cutoff); const dt = 1 / sampleRate; const a = rc / (rc + dt);
  let yPrev = 0, xPrev = 0; const x = new Float32Array(input.length);
  for (let i=0;i<input.length;i++){ const y=a*(yPrev+input[i]-xPrev); xPrev=input[i]; yPrev=y; x[i]=y; }
  // Hann window
  for (let n=0;n<x.length;n++){ x[n] *= 0.5*(1-Math.cos(2*Math.PI*n/(x.length-1))); }
  const N = x.length;
  const maxLag = Math.min(N-1, Math.floor(sampleRate / MIN_F));
  const minLag = Math.max(2, Math.floor(sampleRate / MAX_F));
  let bestLag = -1, bestVal = -Infinity;
  for (let lag=minLag; lag<=maxLag; lag++) {
    let s=0; for (let i=0,j=lag; j<N; i++,j++){ s += x[i]*x[j]; }
    if (s>bestVal){ bestVal=s; bestLag=lag; }
  }
  if (bestLag<0) return null;
  const R = (lag)=>{ if(lag<minLag||lag>maxLag) return -Infinity; let s=0; for(let i=0,j=lag;j<N;i++,j++){ s+=x[i]*x[j]; } return s; };
  const r1=R(bestLag-1), r2=R(bestLag), r3=R(bestLag+1); const denom=(r1-2*r2+r3);
  const shift = denom!==0 ? 0.5*(r1-r3)/denom : 0; const tau = bestLag + shift;
  const f0 = sampleRate / tau; if (!isFinite(f0) || f0<MIN_F || f0>MAX_F) return null; return f0;
}

function noteName(freq){ 
    if(!isFinite(freq)||freq<=0) return '—'; 
    const midi=69+12*Math.log2(freq/440); 
    const m=Math.round(midi); 
    const names=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]; 
    const name=names[(m%12+12)%12]; const oct=Math.floor(m/12)-1; 
    return `${name}${oct}`; 
}