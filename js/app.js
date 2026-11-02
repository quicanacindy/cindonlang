const $=(s,r=document)=>r.querySelector(s);
const getJSON=u=>fetch(u).then(r=>{if(!r.ok)throw Error(u);return r.json()});
const LANGS={ko:'Korean',ja:'Japanese',zh:'Chinese',es:'Español',en:'English'};
(()=>{
 try{const t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}
 document.body.insertAdjacentHTML('afterbegin','<header class="top"><a class="logo" href="index.html">Lingua Log</a><nav><a href="index.html">Home</a><a href="wordbank.html">Word Bank</a><button id="th" aria-label="Cambiar modo claro u oscuro">◐</button></nav></header>');
 $('#th').onclick=()=>{const d=document.documentElement;const c=d.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');const n=c==='dark'?'light':'dark';d.dataset.theme=n;try{localStorage.setItem('theme',n)}catch(e){}};
})();
