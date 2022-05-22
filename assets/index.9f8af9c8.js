import{j as n,d as U,a as X,b as ae,c as ce,e as me,f as ye,g as fe,h as ue,i as he,s as ve,k as ge,r as k,l as y,F as Y,m as Z,n as F,G as W,B as $,v as I,o as xe,p as be,S as j,M as _,q as N,T as we,I as Ce,t as ke,u as Se,R as $e}from"./vendor.95e221f8.js";const Ie=function(){const p=document.createElement("link").relList;if(p&&p.supports&&p.supports("modulepreload"))return;for(const m of document.querySelectorAll('link[rel="modulepreload"]'))s(m);new MutationObserver(m=>{for(const r of m)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function i(m){const r={};return m.integrity&&(r.integrity=m.integrity),m.referrerpolicy&&(r.referrerPolicy=m.referrerpolicy),m.crossorigin==="use-credentials"?r.credentials="include":m.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(m){if(m.ep)return;m.ep=!0;const r=i(m);fetch(m.href,r)}};Ie();const D=l=>l.split("x").map(p=>parseInt(p)),A=l=>{const p={};return l.split(/[\r\n]+/).forEach((i,s)=>{i.split(/ +/).forEach((m,r)=>{const a=m.split("|"),v={type:a[0]};a[0]==="box"&&(v.type="empty",v.item={type:"box",value:parseInt(a[1]),tag:a[2],isRandom:a[1]==="random"}),p[`${r}x${s}`]=v})}),p},je=l=>l[Math.floor(Math.random()*l.length)],R=(l,p)=>{const i=[...l];return p==="left"&&(i[0]-=1),p==="right"&&(i[0]+=1),p==="top"&&(i[1]-=1),p==="bottom"&&(i[1]+=1),p==="top-left"&&(i[0]-=1,i[1]-=1),p==="top-right"&&(i[0]+=1,i[1]-=1),p==="bottom-left"&&(i[0]-=1,i[1]+=1),p==="bottom-right"&&(i[0]+=1,i[1]+=1),i},G=l=>{const i={left:U,right:X,top:ae,bottom:ce,"top-left":me,"top-right":ye,"bottom-left":fe,"bottom-right":ue,here:he}[l];return i?n(i,{fontSize:"small"}):null},b=l=>JSON.parse(JSON.stringify(l)),ee=(l,p)=>l.find(i=>i.coordinates===p),S=80,_e=ve(({children:l})=>n("div",{children:l})),Oe=ge(({children:l})=>n("div",{children:l}));function Le(l){const[p,i]=k.exports.useState(l.level),[s,m]=k.exports.useState(l.level.characters),[r,a]=k.exports.useState(l.level.code),[v,J]=k.exports.useState(!1),[q,ie]=k.exports.useState(-1),[T,ne]=k.exports.useState(1e3);k.exports.useEffect(()=>{i(l.level),m(l.level.characters),a(l.level.code)},[l.level]),k.exports.useEffect(()=>{if(!v)return;const o=setInterval(()=>ie(d=>d+1),T);return()=>clearInterval(o)},[T,v]),k.exports.useEffect(()=>{if(q===-1)return;const o=b(s),d=b(p),c=[];o.forEach((t,g)=>{var E,u,O,z,P,H,K,V,Q;if(c[g]=t.coordinates,t.terminated||(t.step++,t.step===-1))return;const f=r[t.step];if(!f)return;const w=D(t.coordinates);if(f.type==="step"){const h=je(f.directions),x=R(w,h),M=p.cells[x.join("x")];M&&["empty","hole"].includes(M.type)&&(c[g]=x.join("x"))}if(f.type==="goto"&&(t.step=f.step-1),f.type==="pickup"&&!t.item&&((E=d.cells[t.coordinates].item)==null?void 0:E.type)==="box"&&(t.item=d.cells[t.coordinates].item,delete d.cells[t.coordinates].item),f.type==="drop"&&((u=t.item)==null?void 0:u.type)==="box"&&!d.cells[t.coordinates].item&&(d.cells[t.coordinates].item=t.item,delete t.item),f.type==="take"){const h=R(w,f.direction).join("x");!t.item&&((O=d.cells[h])==null?void 0:O.type)==="printer"&&(t.item={type:"box",value:Math.floor(Math.random()*99)},d.cells[h].printed++)}if(f.type==="give"){const h=R(w,f.direction).join("x");t.item&&((z=d.cells[h])==null?void 0:z.type)==="shredder"&&(delete t.item,d.cells[h].shredded++)}if(f.type==="if"){let h=!1;const x=f.conditions[0],M=R(w,x.value1.value).join("x");if(d.cells[M]){const C=((H=(P=s.find(de=>x.value1.value!=="here"&&de.coordinates===M))==null?void 0:P.item)==null?void 0:H.value)||((V=(K=d.cells[M])==null?void 0:K.item)==null?void 0:V.value)||0;let L=0;x.value2.type==="number"&&(L=x.value2.value),x.value2.type==="myitem"&&(L=((Q=t.item)==null?void 0:Q.value)||0),x.operation==="=="&&(h=C===L),x.operation===">"&&(h=C>L),x.operation==="<"&&(h=C<L),x.operation==="<="&&(h=C<=L),x.operation===">="&&(h=C>=L)}if(!h){let C=0;for(C=t.step;C<r.length&&r[C].type!=="endif";C++);t.step=C}}}),o.forEach((t,g)=>{!r[t.step]||(!s.find(w=>w.coordinates===c[g])||s.find((w,E)=>w.coordinates===c[g]&&t.coordinates===c[E])?(t.coordinates=c[g],p.cells[t.coordinates].type==="hole"&&(t.terminated=!0)):r[t.step].type==="step"&&t.step--)});const e=[];o.forEach((t,g)=>{var w;const f=r[t.step];if(!!f&&!e.includes(t.name)&&f.type==="give"&&((w=t.item)==null?void 0:w.type)==="box"){const E=R(D(t.coordinates),f.direction),u=o.find(z=>z.coordinates===E.join("x")),O=u?r[u.step]:null;if(u)if(!u.item)u.item=t.item,delete t.item,e.push(u.name);else if(u.item&&(O==null?void 0:O.type)==="give"&&R(D(u.coordinates),O.direction).join("x")===t.coordinates){const z=t.item;t.item=u.item,u.item=z,e.push(u.name)}else t.step--}}),m(o),i(d)},[q]);const le=Object.keys(p.cells).map(o=>{var t;const d=D(o),c=p.cells[o];let e;return c.type==="empty"&&(e=null),c.type==="hole"&&(e=n("div",{style:{width:"100%",height:"100%",backgroundColor:"black"}})),c.type==="wall"&&(e="wall"),c.type==="printer"&&(e="printer"),c.type==="shredder"&&(e="shredder"),((t=c.item)==null?void 0:t.type)==="box"&&(e=y(Y,{children:[n(Z,{fontSize:"small"})," ",c.item.isRandom&&!v?"?":c.item.value]})),n("div",{style:{position:"absolute",left:d[0]*S,top:d[1]*S,width:S,height:S,borderStyle:"solid",borderColor:"black",borderWidth:1,display:"flex",alignItems:"center",justifyContent:"center"},children:e},o)}),se=s.map(o=>{var c;const d=D(o.coordinates);return y("div",{style:{position:"absolute",opacity:o.terminated?0:1,transform:`translate(${d[0]*S}px, ${d[1]*S+10}px)`,transition:`all ${T}ms ease-in`},children:[n(F,{fontSize:"small",style:{color:o.color}}),((c=o.item)==null?void 0:c.type)==="box"?y(Y,{children:["(",n(Z,{fontSize:"small"})," ",o.item.value,")"]}):null]},o.name)});let B=0;const re=(o,d)=>{let c=null;return o.type==="step"&&(c=y("span",{children:["Step:"," ",n(j,{value:o.directions,variant:"standard",multiple:!0,onChange:e=>{const t=b(r);t[d].directions=e.target.value,a(t)},children:["left","right","top","bottom","top-left","top-right","bottom-left","bottom-right"].map(e=>y(_,{value:e,children:[G(e),e]},e))})]})),o.type==="give"&&(c=y("span",{children:["Give:"," ",n(F,{fontSize:"small"}),n(X,{fontSize:"small"}),n(N,{fontSize:"small"})," ",n(j,{value:o.direction,variant:"standard",onChange:e=>{const t=b(r);t[d].direction=e.target.value,a(t)},children:["left","right","top","bottom","top-left","top-right","bottom-left","bottom-right"].map(e=>y(_,{value:e,children:[G(e),e]},e))})]})),o.type==="take"&&(c=y("span",{children:["Take"," ",n(F,{fontSize:"small"}),n(U,{fontSize:"small"}),n(N,{fontSize:"small"})," ",n(j,{value:o.direction,variant:"standard",onChange:e=>{const t=b(r);t[d].direction=e.target.value,a(t)},children:["left","right","top","bottom","top-left","top-right","bottom-left","bottom-right"].map(e=>y(_,{value:e,children:[G(e),e]},e))})]})),o.type==="goto"&&(c=y("span",{children:["Goto:"," ",n(j,{value:o.step,variant:"standard",onChange:e=>{const t=b(r);t[d].step=e.target.value,a(t)},children:Object.keys(r).map(e=>n(_,{value:e,children:e},e))})]})),o.type==="if"&&(c=y("span",{children:["If:"," ",n(j,{value:o.conditions[0].value1.value,variant:"standard",onChange:e=>{const t=b(r);t[d].conditions[0].value1.value=e.target.value,a(t)},children:["left","right","top","bottom","here","top-left","top-right","bottom-left","bottom-right"].map(e=>y(_,{value:e,children:[G(e),e]},e))}),n(j,{value:o.conditions[0].operation,variant:"standard",onChange:e=>{const t=b(r);t[d].conditions[0].operation=e.target.value,a(t)},children:["==",">","<",">=","<="].map(e=>n(_,{value:e,children:e},e))}),n(j,{value:o.conditions[0].value2.type,onChange:e=>{const t=b(r);e.target.value==="number"&&(t[d].conditions[0].value2={type:"number",value:0}),e.target.value==="myitem"&&(t[d].conditions[0].value2={type:"myitem"}),a(t)},variant:"standard",children:["number","myitem"].map(e=>n(_,{value:e,children:e},e))}),o.conditions[0].value2.type==="number"?n(we,{type:"number",value:o.conditions[0].value2.value,variant:"standard",onChange:e=>{const t=b(r);t[d].conditions[0].value2.value=parseInt(e.target.value)||0,a(t)}}):null]})),o.type==="endif"&&(c="Endif"),o.type==="pickup"&&(c="Pickup"),c||(c=JSON.stringify(o)),o.type==="endif"&&(B-=20),c=y("span",{children:[d,": ",n("span",{style:{paddingLeft:B},children:c}),n(Ce,{size:"small",onMouseDown:()=>{const e=[...r],t=e[d];e.splice(d,1),t.type==="if"&&e.splice(e.findIndex(g=>g.type==="endif"&&g.ifId===t.id),1),t.type==="endif"&&e.splice(e.findIndex(g=>g.type==="if"&&g.id===t.ifId),1),a(e)},children:n(ke,{fontSize:"small"})})]},d),o.type==="if"&&(B+=20),c},pe=k.exports.useMemo(()=>r.map((o,d)=>re(o,d)),[r]);return y(W,{container:!0,children:[y(W,{item:!0,md:6,children:[n("h2",{children:p.task}),n("h4",{children:v&&l.level.win(p.cells,s)?"Win":null}),y("div",{style:{position:"relative",width:p.width*S+S/2,height:p.height*S+S/2},children:[le,se]})]}),y(W,{item:!0,md:1,children:[n("div",{children:n($,{onClick:()=>{const o=[...r];o.push({type:"step",directions:["left"],id:I()}),a(o)},children:"Add step"})}),n("div",{children:n($,{onClick:()=>{const o=[...r];o.push({type:"give",direction:"left",id:I()}),a(o)},children:"Add give"})}),n("div",{children:n($,{onClick:()=>{const o=[...r];o.push({type:"take",direction:"left",id:I()}),a(o)},children:"Add take"})}),n("div",{children:n($,{onClick:()=>{const o=[...r];o.push({type:"goto",step:0,id:I()}),a(o)},children:"Add goto"})}),n("div",{children:n($,{onClick:()=>{const o=[...r];o.push({type:"pickup",id:I()}),a(o)},children:"Add pickup"})}),n("div",{children:n($,{onClick:()=>{const o=[...r];o.push({type:"drop",id:I()}),a(o)},children:"Add drop"})}),n("div",{children:n($,{onClick:()=>{const o=[...r],d=I();o.push({type:"if",conditions:[{value1:{type:"direction",value:"here"},operation:"==",value2:{type:"number",value:0}}],id:d},{type:"endif",ifId:I()}),a(o)},children:"Add if"})})]}),n(W,{item:!0,md:5,children:y("div",{style:{paddingLeft:20},children:[n(Oe,{onSortEnd:({oldIndex:o,newIndex:d},c)=>{if(c.ctrlKey){const e=b(r);e.splice(d,0,r[o]),a(e)}else a(xe(r,o,d))},children:r.map((o,d)=>y(_e,{index:d,children:[s.filter(e=>e.step===d).map(e=>n("span",{children:n(F,{fontSize:"small",style:{color:e.color}})},e.name)),pe[d]]},d))}),y("div",{style:{paddingTop:20},children:["Speed:"," ",n("input",{type:"number",value:1e3/T,onChange:o=>ne(1e3/(parseInt(o.target.value)||1))})]}),n("div",{children:n($,{onClick:()=>{const o=b(l.level);v||Object.values(o.cells).forEach(d=>{var c;((c=d.item)==null?void 0:c.isRandom)&&(d.item.value=Math.floor(Math.random()*99))}),i(o),m(l.level.characters),J(!v)},disabled:B!==0,children:v?"Stop":"Run"})}),n("div",{children:n($,{onClick:()=>be(JSON.stringify(r,null,2)),children:"Copy"})})]})})]})}const Ae={task:"Remove two boxes",width:5,height:5,cells:A(`box|1 box|1 empty box|1 empty
empty empty wall box|2 empty
empty empty wall box|3 empty
empty empty empty box|4 empty
empty empty empty box|5 empty
hole hole
hole hole`),characters:[{coordinates:"0x0",name:"first",color:"red",step:-1},{coordinates:"1x0",name:"second",color:"green",step:-1}],code:[],win:(l,p)=>Object.values(l).filter(i=>{var s;return((s=i.item)==null?void 0:s.type)==="box"}).length+p.filter(i=>{var s;return!i.terminated&&((s=i.item)==null?void 0:s.type)==="box"}).length===5},Ee={task:"Move boxes",width:5,height:5,cells:A(`box|1 box|1 empty box|1 empty
empty empty wall box|2 empty
empty empty wall box|3 empty
empty empty empty box|4 empty
empty empty empty box|5 empty`),characters:[{coordinates:"0x0",name:"first",color:"red",step:-1},{coordinates:"1x0",name:"second",color:"green",step:-1}],code:[{type:"step",directions:["left","right","top","bottom"]},{type:"step",directions:["left","right","top","bottom"]},{type:"pickup"},{type:"step",directions:["left","right","top","bottom"]},{type:"step",directions:["left","right","top","bottom"]},{type:"drop"},{type:"goto",step:0}],win:(l,p)=>Object.values(l).filter(i=>{var s;return((s=i.item)==null?void 0:s.type)==="box"}).length+p.filter(i=>{var s;return((s=i.item)==null?void 0:s.type)==="box"}).length===5},ze={task:"Remove only box with 2",width:5,height:5,cells:A(`empty empty empty empty empty
box|2|tag2 box|1|tag1 wall empty empty
empty empty wall empty empty
empty empty empty empty empty
empty empty empty empty empty
hole hole
hole hole`),characters:[{coordinates:"0x0",name:"first",color:"red",step:-1},{coordinates:"1x0",name:"second",color:"green",step:-1}],code:[{type:"step",directions:["bottom"]},{type:"if",conditions:[{value1:{type:"direction",value:"here"},operation:">",value2:{type:"number",value:1}}],id:"if1"},{type:"pickup"},{type:"endif",ifId:"if1"},{type:"goto",step:0}],win:(l,p)=>(Object.values(l).find(i=>{var s;return((s=i.item)==null?void 0:s.tag)==="tag1"})||p.find(i=>{var s;return((s=i.item)==null?void 0:s.tag)==="tag1"}))&&!(Object.values(l).find(i=>{var s;return((s=i.item)==null?void 0:s.tag)==="tag2"})||p.find(i=>{var s;return!i.terminated&&((s=i.item)==null?void 0:s.tag)==="tag2"}))},Me={task:"Diagonal boxes",width:5,height:5,cells:A(`empty empty empty empty empty
box|1 box|1 box|1 box|1 box|1
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty`),characters:[{coordinates:"1x1",name:"first",color:"red",step:-1},{coordinates:"2x1",name:"second",color:"green",step:-1},{coordinates:"3x1",name:"3",color:"yellow",step:-1},{coordinates:"4x1",name:"4",color:"blue",step:-1}],code:[],win:(l,p)=>[0,1,2,3,4].every(i=>{var s;return((s=l[`${i}x${i+1}`].item)==null?void 0:s.type)==="box"})},Re={task:"Sort numbers",width:5,height:5,cells:A(`empty empty empty empty empty
box|random box|random box|random box|random box|random
empty empty empty empty empty
empty empty empty empty empty
empty empty empty empty empty`),characters:[{coordinates:"0x1",name:"1",color:"purple",step:-1},{coordinates:"1x1",name:"2",color:"red",step:-1},{coordinates:"2x1",name:"3",color:"green",step:-1},{coordinates:"3x1",name:"4",color:"yellow",step:-1},{coordinates:"4x1",name:"5",color:"blue",step:-1}],code:[{type:"pickup"},{type:"if",id:"if1",conditions:[{value1:{type:"direction",value:"right"},operation:"<",value2:{type:"myitem"}}]},{type:"give",direction:"right"},{type:"endif",ifId:"if1"},{type:"if",id:"if2",conditions:[{value1:{type:"direction",value:"left"},operation:">",value2:{type:"myitem"}}]},{type:"give",direction:"left"},{type:"endif",ifId:"if2"},{type:"goto",step:1}],win:(l,p)=>[0,1,2,3,4].every(i=>{var s,m,r,a;return i===0||((m=(s=ee(p,`${i}x1`))==null?void 0:s.item)==null?void 0:m.value)>=((a=(r=ee(p,`${i-1}x1`))==null?void 0:r.item)==null?void 0:a.value)})},De={task:"Print and shred 10 boxes",width:5,height:5,cells:A(`empty empty empty empty empty
empty empty empty empty empty
empty printer shredder empty empty
empty empty empty empty empty
empty empty empty empty empty`),characters:[{coordinates:"1x1",name:"first",color:"red",step:-1},{coordinates:"2x1",name:"second",color:"green",step:-1}],code:[],win:(l,p)=>l["2x2"].shredded>=10},Te={task:"Print and shred 10 boxes (no move)",width:7,height:5,cells:A(`hole hole hole hole hole hole hole
hole empty empty empty empty empty hole
hole printer hole hole hole shredder hole
hole hole hole hole hole hole hole
hole hole hole hole hole hole hole`),characters:[{coordinates:"1x1",name:"1",color:"purple",step:-1},{coordinates:"2x1",name:"2",color:"red",step:-1},{coordinates:"3x1",name:"3",color:"green",step:-1},{coordinates:"4x1",name:"4",color:"yellow",step:-1},{coordinates:"5x1",name:"5",color:"blue",step:-1}],code:[],win:(l,p)=>l["5x2"].shredded>=10},te=[Ae,Ee,ze,Me,Re,De,Te];function Be(){const[l,p]=k.exports.useState(0);return y("div",{className:"App",children:[n("h1",{children:"Open7BH"}),n(j,{variant:"standard",value:l,onChange:i=>p(parseInt(i.target.value)),children:te.map((i,s)=>n(_,{value:s,children:i.task},s))}),n(Le,{level:te[l]})]})}const Fe="modulepreload",oe={},We="/",Ge=function(p,i){return!i||i.length===0?p():Promise.all(i.map(s=>{if(s=`${We}${s}`,s in oe)return;oe[s]=!0;const m=s.endsWith(".css"),r=m?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${s}"]${r}`))return;const a=document.createElement("link");if(a.rel=m?"stylesheet":Fe,m||(a.as="script",a.crossOrigin=""),a.href=s,document.head.appendChild(a),m)return new Promise((v,J)=>{a.addEventListener("load",v),a.addEventListener("error",J)})})).then(()=>p())},Je=l=>{l&&l instanceof Function&&Ge(()=>import("./web-vitals.67dce932.js"),[]).then(({getCLS:p,getFID:i,getFCP:s,getLCP:m,getTTFB:r})=>{p(l),i(l),s(l),m(l),r(l)})},qe=Se.createRoot(document.getElementById("root"));qe.render(n($e.StrictMode,{children:n(Be,{})}));Je();
