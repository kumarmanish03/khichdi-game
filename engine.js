(function(root){
const W=20,H=24,types=['potato','veggie','pea','dal','rice'];
const shapes={potato:['00111100','01111110','11111111','11111111','11111111','01111110','00111100'],veggie:['01110','11111','11111','01110'],pea:['010','111','010']};
const ingredients={potato:{name:'Potatoes',singular:'potato',note:'Big, happy chunks',size:'XL',batch:1,color:'#dfa058'},veggie:{name:'Chunky veggies',singular:'veggie chunk',note:'Carrot & pumpkin cubes',size:'L',batch:1,color:'#f07c4f'},pea:{name:'Peas',singular:'pea',note:'Little green party guests',size:'M',batch:1,color:'#8fb75e'},dal:{name:'Dal',singular:'scoop of dal',note:'Golden split lentils',size:'S',batch:4,color:'#e7bd4d'},rice:{name:'Rice',singular:'scoop of rice',note:'Tiny grains, big finish',size:'XS',batch:10,color:'#f6edcc'}};
const levels=[{name:'The lunch bell',people:24,tag:'A cosy lunch',recipe:{potato:4,veggie:6,pea:10,dal:22,rice:112}},{name:'More guests, please!',people:40,tag:'A busy kitchen',recipe:{potato:4,veggie:7,pea:12,dal:22,rice:86}},{name:'The Sunday feast',people:60,tag:'A grand feast',recipe:{potato:4,veggie:8,pea:8,dal:32,rice:70}}];
class Pot{
constructor(level=0){this.level=level;this.grid=Array.from({length:H},()=>Array(W).fill(null));this.left={...levels[level].recipe};this.history=[];this.moves=0;this.failed=false;this.ready=false;this.orderError=null;}
fits(shape,x,y){return shape.every((row,dy)=>[...row].every((v,dx)=>v==='0'||(y+dy<H&&x+dx<W&&!this.grid[y+dy][x+dx])));}
place(type){if(this.failed||this.ready||!types.includes(type)||!this.left[type])return {ok:false,reason:'unavailable'};const before={grid:this.grid.map(r=>r.slice()),left:{...this.left},moves:this.moves};const expected=types.find(t=>this.left[t]);
// Each ingredient must be finished before the next smaller ingredient starts.
// A rejected pour is itself undoable, including on a completely empty pot.
if(type!==expected){this.history.push(before);this.failed=true;this.orderError={attempted:type,expected};return {ok:false,reason:'order',expected};}
let cells=[];
if(type==='rice'||type==='dal'){
const amount=Math.min(ingredients[type].batch,this.left[type]),width=type==='dal'?2:1;
for(let i=0;i<amount;i++){let target=null;for(let y=H-1;y>=0&&!target;y--)for(let x=0;x<=W-width;x++)if(Array.from({length:width},(_,dx)=>!this.grid[y][x+dx]).every(Boolean)){target={x,y};break;}if(!target)break;for(let dx=0;dx<width;dx++){const p={x:target.x+dx,y:target.y};this.grid[p.y][p.x]={type,id:this.moves};cells.push(p);}}
if(cells.length<amount*width){this.grid=before.grid;this.failed=true;return {ok:false,reason:'full'};}this.left[type]-=amount;
}else{const shape=shapes[type];let best=null;for(let x=0;x<=W-shape[0].length;x++){if(!this.fits(shape,x,0))continue;let y=0;while(this.fits(shape,x,y+1))y++;if(!best||y>best.y)best={x,y};}if(!best){this.failed=true;return {ok:false,reason:'blocked'};}shape.forEach((row,dy)=>[...row].forEach((v,dx)=>{if(v==='1'){const p={x:best.x+dx,y:best.y+dy};this.grid[p.y][p.x]={type,id:this.moves};cells.push(p);}}));this.left[type]--;}
this.history.push(before);this.moves++;this.ready=Object.values(this.left).every(n=>n===0);return {ok:true,cells,ready:this.ready};}
undo(){const b=this.history.pop();this.failed=false;this.ready=false;this.orderError=null;if(b){this.grid=b.grid;this.left=b.left;this.moves=b.moves;}return !!b;}
}
const api={Pot,levels,W,H,types,shapes,ingredients};if(typeof module!=='undefined')module.exports=api;else root.Khichdi=api;
})(typeof window!=='undefined'?window:globalThis);

