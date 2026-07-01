fetch('data.json').then(r=>r.json()).then(data=>{
data.sort((a,b)=>a.Rank-b.Rank);
document.getElementById('topdistrict').textContent=data[0].District;
document.getElementById('topscore').textContent=Number(data[0]['Economic Strength Score']).toFixed(2);
const tb=document.getElementById('tbody');
function render(list){
tb.innerHTML='';
list.forEach(d=>{
tb.innerHTML+=`<tr><td>${d.Rank}</td><td>${d.District}</td><td>${Number(d['Economic Strength Score']).toFixed(2)}</td></tr>`;
});
}
render(data);
document.getElementById('search').oninput=e=>{
let q=e.target.value.toLowerCase();
render(data.filter(x=>x.District.toLowerCase().includes(q)));
}
let top=data.slice(0,10);
Plotly.newPlot('bar',[{type:'bar',orientation:'h',y:top.map(x=>x.District).reverse(),x:top.map(x=>x['Economic Strength Score']).reverse()}]);
Plotly.newPlot('hist',[{type:'histogram',x:data.map(x=>x['Economic Strength Score'])}]);

const map=L.map('map').setView([27.2,80.9],6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
fetch('up_districts.geojson').then(r=>r.json()).then(raw=>{
let geo=raw;
if(raw.type==='Topology'){
 const key=Object.keys(raw.objects)[0];
 geo=topojson.feature(raw, raw.objects[key]);
}
L.geoJSON(geo,{
style:f=>({color:'#555',weight:1,fillOpacity:.7,fillColor:'#7fc97f'}),
onEachFeature:(f,l)=>{
 let p=f.properties||{};
 let name=p.district||p.DISTRICT||p.dtname||p.NAME||p.name||'';
 let d=data.find(x=>x.District.toLowerCase().replace(/\s+/g,'')===String(name).toLowerCase().replace(/\s+/g,''));
 if(d){
  l.bindTooltip(`${d.District}<br>Rank: ${d.Rank}<br>Score: ${Number(d['Economic Strength Score']).toFixed(2)}`);
  l.on('click',()=>{
   document.getElementById('profile').innerHTML=`<h3>${d.District}</h3>
   <b>Rank:</b> ${d.Rank}<br>
   <b>Economic Strength:</b> ${Number(d['Economic Strength Score']).toFixed(2)}<br>
   <b>GDDP:</b> ${d['GDDP Score']}<br>
   <b>Per Capita:</b> ${d['PC GDDP Score']}<br>
   <b>Structure:</b> ${d['Structural Score']}<br>
   <b>CAGR:</b> ${d['CAGR Score']}`;
   Plotly.newPlot('radar',[{type:'scatterpolar',fill:'toself',
   r:[d['GDDP Score'],d['PC GDDP Score'],d['Structural Score'],d['CAGR Score']],
   theta:['GDDP','PC','Structure','CAGR']}],{polar:{radialaxis:{range:[0,100]}}});
  });
 }
}
}).addTo(map);
}).catch(err=>console.error(err));
});
