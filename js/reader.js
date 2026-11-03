const id=new URLSearchParams(location.search).get('id')||'too-much-coffee';
const audio=new Audio(),speeds=[.75,1,1.25,1.5];
let A,WB={},cur=-1,loop=false,si=1,hasAudio=true;
const fmt=s=>isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
const mark=i=>{cur=i;document.querySelectorAll('.line').forEach((e,n)=>e.classList.toggle('on',n==i));const el=$('.line.on');if(el)el.scrollIntoView({block:'center',behavior:'smooth'})};
const go=i=>{if(!hasAudio||!A.lines[i])return;audio.currentTime=A.lines[i].start;mark(i);audio.play()};
(async()=>{
 try{A=await getJSON(`data/articles/${id}.json`)}catch(e){$('#reader').textContent='Article not found.';return}
 try{(await getJSON(`data/wordbank/${A.lang}.json`)).forEach(w=>WB[w.w]=w)}catch(e){}
 document.title=A.title+' · Cindon Lang';
 $('#hero').innerHTML=`<div class="wrap"><span class="meta">${A.category} · ${A.level}</span><h1 lang="${A.lang}">${A.title}</h1><p>${A.description}</p><div class="stats"><div><b>${A.lines.length}</b>Lines</div><div><b id="dur2">–</b>Audio</div></div><a class="btn" href="#reader">START</a>${A.youtube?` <a class="meta" href="${A.youtube}" target="_blank" rel="noopener">Watch the video on YouTube</a>`:''}</div>`;
 $('#reader').lang=A.lang;
 $('#reader').innerHTML=A.lines.map((l,i)=>`<p class="line${l.p?' np':''}" data-i="${i}">${l.text.replace(/\[([^\]|]+)(?:\|([^\]]+))?\]/g,(m,s,k)=>`<u class="w" data-k="${k||s}">${s}</u>`)}</p>${l.image?`<img src="data/${l.image}" alt="">`:''}`).join('');
 audio.src='data/'+A.audio;audio.preload='metadata';
 audio.onerror=()=>{hasAudio=false;$('#note').hidden=false;$('#note').textContent='Audio missing: upload your MP3 to data/'+A.audio};
 audio.onloadedmetadata=()=>{$('#bar').max=audio.duration;$('#dur').textContent=$('#dur2').textContent=fmt(audio.duration)};
 audio.ontimeupdate=()=>{const t=audio.currentTime;
  if(loop&&cur>=0&&t>=A.lines[cur].end){audio.currentTime=A.lines[cur].start;return}
  const i=A.lines.findIndex(l=>t>=l.start&&t<l.end);if(i>=0&&i!==cur)mark(i);
  $('#bar').value=t;$('#cur').textContent=fmt(t)};
 audio.onplay=()=>$('#play').textContent='❚❚';audio.onpause=()=>$('#play').textContent='▶';
 $('#play').onclick=()=>hasAudio&&(audio.paused?audio.play():audio.pause());
 $('#prev').onclick=()=>go(Math.max(0,cur-1));$('#next').onclick=()=>go(Math.min(A.lines.length-1,cur+1));
 $('#bar').oninput=e=>audio.currentTime=e.target.value;
 $('#spd').onclick=()=>{si=(si+1)%speeds.length;audio.playbackRate=speeds[si];$('#spd').textContent=speeds[si]+'×'};
 $('#rep').onclick=e=>{loop=!loop;e.currentTarget.classList.toggle('active',loop)};
 $('#big').onclick=()=>$('#reader').classList.toggle('big');
 $('#reader').onclick=e=>{
  const w=e.target.closest('.w');
  if(w){const x=WB[w.dataset.k];const t=$('#tip');t.hidden=false;t.innerHTML=x?`<b>${x.w}</b> (${x.type}): ${x.tr}`:`<b>${w.dataset.k}</b>: no translation yet`;clearTimeout(t._t);t._t=setTimeout(()=>t.hidden=true,4000);return}
  const l=e.target.closest('.line');if(l)go(+l.dataset.i)};
 if('mediaSession' in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:A.title,artist:'Cindon Lang'});
  navigator.mediaSession.setActionHandler('play',()=>audio.play());navigator.mediaSession.setActionHandler('pause',()=>audio.pause());
  navigator.mediaSession.setActionHandler('previoustrack',()=>go(Math.max(0,cur-1)));navigator.mediaSession.setActionHandler('nexttrack',()=>go(cur+1))}
})();
