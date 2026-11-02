const REPO='quicanacindy/cindonlang';
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const slug=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
const plain=s=>s.replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\*\*/g,'');
const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(m,t,u)=>`<a href="${u}"${u[0]=='#'?'':' target="_blank" rel="noopener"'}>${t}</a>`);
function render(md){
 const used={};let h='',list=false;const close=()=>{if(list){h+='</ul>';list=false}};
 for(const raw of md.split(/\r?\n/)){
  let line=raw.trim(),id='';const m=line.match(/\s*\{#([^}\s]+)\}$/);
  if(m){id=m[1];line=line.slice(0,m.index)}
  if(!line){close();continue}
  const hd=line.match(/^(#{2,3})\s+(.*)/),li=line.match(/^[-*]\s+(.*)/),txt=hd?hd[2]:li?li[1]:line;
  if(hd&&!id)id=slug(plain(txt));
  if(id){let n=id,i=2;while(used[n])n=id+'-'+i++;used[n]=1;id=n}
  const a=id?` id="${id}"`:'',b=id?`<button class="lk" title="Copy link" aria-label="Copy link" data-id="${id}" data-t="${esc(plain(txt)).replace(/"/g,'&quot;')}">#</button>`:'';
  if(hd){close();const t='h'+hd[1].length;h+=`<${t}${a}>${inline(txt)}${b}</${t}>`}
  else if(li){if(!list){h+='<ul>';list=true}h+=`<li${a}>${inline(txt)}${b}</li>`}
  else{close();h+=`<p${a}>${inline(txt)}${b}</p>`}
 }
 close();return h}
//--dom
const lang=new URLSearchParams(location.search).get('lang');
try{if(new URLSearchParams(location.search).get('owner')==='1')localStorage.setItem('cl-owner','1')}catch(e){}
$('#tabs').innerHTML=Object.entries(LANGS).map(([k,v])=>`<a href="notes.html?lang=${k}" class="${k==lang?'active':''}">${v}</a>`).join('');
if(!LANGS[lang])$('#notes').innerHTML='<p>Choose a language to open its notebook.</p>';
else fetch(`data/notes/${lang}.md`).then(r=>r.ok?r.text():null).then(t=>{
 let own=false;try{own=localStorage.getItem('cl-owner')==='1'}catch(e){}
 if(own)$('#bar').innerHTML=`<a href="https://github.com/${REPO}/${t===null?'new/main/data/notes?filename='+lang+'.md':'edit/main/data/notes/'+lang+'.md'}" target="_blank" rel="noopener">Edit these notes on GitHub</a>`;
 $('#notes').lang=lang;$('#notes').innerHTML=t===null?'<p>No notes yet.</p>':render(t);
 if(location.hash){const el=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(el)el.scrollIntoView()}
}).catch(()=>$('#notes').textContent='Could not load the notes.');
$('#notes').onclick=e=>{const b=e.target.closest('.lk');if(!b)return;
 history.replaceState(null,'','#'+b.dataset.id);
 const s=`[${b.dataset.t}](#${b.dataset.id})`;
 navigator.clipboard.writeText(s).then(()=>{b.textContent='copied';setTimeout(()=>b.textContent='#',1500)}).catch(()=>prompt('Copy this link:',s))};
