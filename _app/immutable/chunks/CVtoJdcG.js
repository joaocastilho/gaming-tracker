import"./DsnmJJEf.js";import{i as pe}from"./CrUECPgc.js";import{q as fe,y as v,z as V,ay as U,az as Se,A as K,E as _e,B as ye,aA as we,aB as De,aC as Pe,aD as Ae,aE as Ge,V as k,U as H,a2 as Ee,Y as le,aF as x,aG as W,aH as ue,e as ce,aI as Ne,aJ as $e,aK as Oe,aL as Ce,aM as Me,aN as Te,aO as xe,aP as Le,j as R,aQ as Re,aR as ke,aS as ze,C as Ie,aT as Be,aU as Fe,aV as Ue,p as He,aW as qe,d as je,i as I,a as B,b as O,s as Ve,g as We,c as Ye,u as Z,m as E,ag as Ke,ah as Je,w as Xe,x as L}from"./BdHjqEeA.js";import{l as C,p as G,s as J}from"./CZnIKM9l.js";import{e as Qe,i as Ze,d as et,g as ee}from"./QvXVa1Gx.js";import{r as tt}from"./CZlLVsl0.js";function at(e,r){if(r){const t=document.body;e.autofocus=!0,fe(()=>{document.activeElement===t&&e.focus()})}}let te=!1;function rt(){te||(te=!0,document.addEventListener("reset",e=>{Promise.resolve().then(()=>{if(!e.defaultPrevented)for(const r of e.target.elements)r.__on_r?.()})},{capture:!0}))}function F(e,r,t,a,i){v&&V();var s=r.$$slots?.[t],o=!1;s===!0&&(s=r.children,o=!0),s===void 0||s(e,o?()=>a:a)}function it(e,r,t,a,i,s){let o=v;v&&V();var n=null;v&&U.nodeType===Se&&(n=U,V());var l=v?U:e,d=new ye(l,!1);K(()=>{const m=r()||null;var c=we;if(m===null){d.ensure(null,null),x(!0);return}return d.ensure(m,f=>{if(m){if(n=v?n:document.createElementNS(c,m),De(n,n),a){v&&Pe(m)&&n.append(document.createComment(""));var b=v?Ae(n):n.appendChild(Ge());v&&(b===null?k(!1):H(b)),a(n,b)}Ee.nodes_end=n,f.before(n)}v&&H(f)}),x(!0),()=>{m&&x(!1)}},_e),le(()=>{x(!0)}),o&&(k(!0),H(l))}function ot(e,r){var t=void 0,a;K(()=>{t!==(t=r())&&(a&&(W(a),a=null),t&&(a=ue(()=>{ce(()=>t(e))})))})}function de(e){var r,t,a="";if(typeof e=="string"||typeof e=="number")a+=e;else if(typeof e=="object")if(Array.isArray(e)){var i=e.length;for(r=0;r<i;r++)e[r]&&(t=de(e[r]))&&(a&&(a+=" "),a+=t)}else for(t in e)e[t]&&(a&&(a+=" "),a+=t);return a}function st(){for(var e,r,t=0,a="",i=arguments.length;t<i;t++)(e=arguments[t])&&(r=de(e))&&(a&&(a+=" "),a+=r);return a}function nt(e){return typeof e=="object"?st(e):e??""}const ae=[...` 	
\r\f \v\uFEFF`];function ft(e,r,t){var a=e==null?"":""+e;if(r&&(a=a?a+" "+r:r),t){for(var i in t)if(t[i])a=a?a+" "+i:i;else if(a.length)for(var s=i.length,o=0;(o=a.indexOf(i,o))>=0;){var n=o+s;(o===0||ae.includes(a[o-1]))&&(n===a.length||ae.includes(a[n]))?a=(o===0?"":a.substring(0,o))+a.substring(n+1):o=n}}return a===""?null:a}function re(e,r=!1){var t=r?" !important;":";",a="";for(var i in e){var s=e[i];s!=null&&s!==""&&(a+=" "+i+": "+s+t)}return a}function q(e){return e[0]!=="-"||e[1]!=="-"?e.toLowerCase():e}function lt(e,r){if(r){var t="",a,i;if(Array.isArray(r)?(a=r[0],i=r[1]):a=r,e){e=String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g,"").trim();var s=!1,o=0,n=!1,l=[];a&&l.push(...Object.keys(a).map(q)),i&&l.push(...Object.keys(i).map(q));var d=0,m=-1;const S=e.length;for(var c=0;c<S;c++){var f=e[c];if(n?f==="/"&&e[c-1]==="*"&&(n=!1):s?s===f&&(s=!1):f==="/"&&e[c+1]==="*"?n=!0:f==='"'||f==="'"?s=f:f==="("?o++:f===")"&&o--,!n&&s===!1&&o===0){if(f===":"&&m===-1)m=c;else if(f===";"||c===S-1){if(m!==-1){var b=q(e.substring(d,m).trim());if(!l.includes(b)){f!==";"&&c++;var y=e.substring(d,c).trim();t+=" "+y+";"}}d=c+1,m=-1}}}}return a&&(t+=re(a)),i&&(t+=re(i,!0)),t=t.trim(),t===""?null:t}return e==null?null:String(e)}function ut(e,r,t,a,i,s){var o=e.__className;if(v||o!==t||o===void 0){var n=ft(t,a,s);(!v||n!==e.getAttribute("class"))&&(n==null?e.removeAttribute("class"):r?e.className=n:e.setAttribute("class",n)),e.__className=t}else if(s&&i!==s)for(var l in s){var d=!!s[l];(i==null||d!==!!i[l])&&e.classList.toggle(l,d)}return s}function j(e,r={},t,a){for(var i in t){var s=t[i];r[i]!==s&&(t[i]==null?e.style.removeProperty(i):e.style.setProperty(i,s,a))}}function ct(e,r,t,a){var i=e.__style;if(v||i!==r){var s=lt(r,a);(!v||s!==e.getAttribute("style"))&&(s==null?e.removeAttribute("style"):e.style.cssText=s),e.__style=r}else a&&(Array.isArray(a)?(j(e,t?.[0],a[0]),j(e,t?.[1],a[1],"important")):j(e,t,a));return a}function Y(e,r,t=!1){if(e.multiple){if(r==null)return;if(!Ne(r))return $e();for(var a of e.options)a.selected=r.includes(ie(a));return}for(a of e.options){var i=ie(a);if(Oe(i,r)){a.selected=!0;return}}(!t||r!==void 0)&&(e.selectedIndex=-1)}function dt(e){var r=new MutationObserver(()=>{Y(e,e.__value)});r.observe(e,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),le(()=>{r.disconnect()})}function ie(e){return"__value"in e?e.__value:e.value}const N=Symbol("class"),$=Symbol("style"),ge=Symbol("is custom element"),me=Symbol("is html");function gt(e){if(v){var r=!1,t=()=>{if(!r){if(r=!0,e.hasAttribute("value")){var a=e.value;z(e,"value",null),e.value=a}if(e.hasAttribute("checked")){var i=e.checked;z(e,"checked",null),e.checked=i}}};e.__on_r=t,fe(t),rt()}}function Gt(e,r){var t=X(e);t.value===(t.value=r??void 0)||e.value===r&&(r!==0||e.nodeName!=="PROGRESS")||(e.value=r??"")}function mt(e,r){r?e.hasAttribute("selected")||e.setAttribute("selected",""):e.removeAttribute("selected")}function z(e,r,t,a){var i=X(e);v&&(i[r]=e.getAttribute(r),r==="src"||r==="srcset"||r==="href"&&e.nodeName==="LINK")||i[r]!==(i[r]=t)&&(r==="loading"&&(e[Ce]=t),t==null?e.removeAttribute(r):typeof t!="string"&&ve(e).includes(r)?e[r]=t:e.setAttribute(r,t))}function vt(e,r,t,a,i=!1,s=!1){if(v&&i&&e.tagName==="INPUT"){var o=e,n=o.type==="checkbox"?"defaultChecked":"defaultValue";n in t||gt(o)}var l=X(e),d=l[ge],m=!l[me];let c=v&&d;c&&k(!1);var f=r||{},b=e.tagName==="OPTION";for(var y in r)y in t||(t[y]=null);t.class?t.class=nt(t.class):(a||t[N])&&(t.class=null),t[$]&&(t.style??=null);var S=ve(e);for(const u in t){let g=t[u];if(b&&u==="value"&&g==null){e.value=e.__value="",f[u]=g;continue}if(u==="class"){var h=e.namespaceURI==="http://www.w3.org/1999/xhtml";ut(e,h,g,a,r?.[N],t[N]),f[u]=g,f[N]=t[N];continue}if(u==="style"){ct(e,g,r?.[$],t[$]),f[u]=g,f[$]=t[$];continue}var D=f[u];if(!(g===D&&!(g===void 0&&e.hasAttribute(u)))){f[u]=g;var M=u[0]+u[1];if(M!=="$$")if(M==="on"){const w={},A="$$"+u;let _=u.slice(2);var P=Ue(_);if(ke(_)&&(_=_.slice(0,-7),w.capture=!0),!P&&D){if(g!=null)continue;e.removeEventListener(_,f[A],w),f[A]=null}if(g!=null)if(P)e[`__${_}`]=g,Ie([_]);else{let be=function(he){f[u].call(this,he)};f[A]=ze(_,e,be,w)}else P&&(e[`__${_}`]=void 0)}else if(u==="style")z(e,u,g);else if(u==="autofocus")at(e,!!g);else if(!d&&(u==="__value"||u==="value"&&g!=null))e.value=e.__value=g;else if(u==="selected"&&b)mt(e,g);else{var p=u;m||(p=Be(p));var T=p==="defaultValue"||p==="defaultChecked";if(g==null&&!d&&!T)if(l[u]=null,p==="value"||p==="checked"){let w=e;const A=r===void 0;if(p==="value"){let _=w.defaultValue;w.removeAttribute(p),w.defaultValue=_,w.value=w.__value=A?_:null}else{let _=w.defaultChecked;w.removeAttribute(p),w.defaultChecked=_,w.checked=A?_:!1}}else e.removeAttribute(u);else T||S.includes(p)&&(d||typeof g!="string")?(e[p]=g,p in l&&(l[p]=Fe)):typeof g!="function"&&z(e,p,g)}}}return c&&k(!0),f}function oe(e,r,t=[],a=[],i,s=!1,o=!1){Le(t,a,n=>{var l=void 0,d={},m=e.nodeName==="SELECT",c=!1;if(K(()=>{var b=r(...n.map(R)),y=vt(e,l,b,i,s,o);c&&m&&"value"in b&&Y(e,b.value);for(let h of Object.getOwnPropertySymbols(d))b[h]||W(d[h]);for(let h of Object.getOwnPropertySymbols(b)){var S=b[h];h.description===Re&&(!l||S!==l[h])&&(d[h]&&W(d[h]),d[h]=ue(()=>ot(e,()=>S))),y[h]=S}l=y}),m){var f=e;ce(()=>{Y(f,l.value,!0),dt(f)})}c=!0})}function X(e){return e.__attributes??={[ge]:e.nodeName.includes("-"),[me]:e.namespaceURI===Me}}var se=new Map;function ve(e){var r=e.getAttribute("is")||e.nodeName,t=se.get(r);if(t)return t;se.set(r,t=[]);for(var a,i=e,s=Element.prototype;s!==i;){a=xe(i);for(var o in a)a[o].set&&t.push(o);i=Te(i)}return t}const Et={PC:"bg-[#1e40af] text-white",PS4:"bg-[#f59e0b] text-[#fef3c7]",PS3:"bg-[#ef4444] text-[#fecaca]",PS2:"bg-[#a855f7] text-[#e9d5ff]",PS1:"bg-[#f97316] text-white",Switch:"bg-[#22c55e] text-[#dcfce7]","3DS":"bg-[#ec4899] text-[#fce7f3]",N64:"bg-[#7c3aed] text-white",GameCube:"bg-[#06b6d4] text-[#cffafe]","Game Boy Advance":"bg-[#dc2626] text-[#fca5a5]",Xbox:"bg-[#166534] text-[#dcfce7]","Xbox 360":"bg-[#65a30d] text-[#f7f9e3]",Dreamcast:"bg-[#0d9488] text-[#ccfbf1]"},Nt={Platformer:"bg-[#dc2626] text-white","Action Platformer":"bg-[#7f1d1d] text-white","Puzzle Platformer":"bg-[#7c3aed] text-white","Story Platformer":"bg-[#ea580c] text-white","Story Adventure":"bg-[#92400e] text-white","Action Adventure":"bg-[#0d9488] text-white","Survival Horror":"bg-[#581c87] text-white","Story Puzzle":"bg-[#be185d] text-white",Puzzle:"bg-[#15803d] text-white","Action RPG":"bg-[#b91c1c] text-white","Classic RPG":"bg-[#7c2d12] text-white","Japanese RPG":"bg-[#0891b2] text-white","Sandbox RPG":"bg-[#4d7c0f] text-white","Story RPG":"bg-[#be123c] text-white",FPS:"bg-[#991b1b] text-white",Action:"bg-[#9a3412] text-white","Bullet Hell":"bg-[#dc143c] text-white","Hack & Slash":"bg-[#c2410c] text-white",Survival:"bg-[#166534] text-white",Strategy:"bg-[#1e40af] text-white",Metroidvania:"bg-[#6b21a8] text-white",Roguelike:"bg-[#f97316] text-white","Story Horror":"bg-[#4c1d95] text-white","Horror RPG":"bg-[#0f172a] text-white"},$t={"S - Masterpiece":"bg-[#dc2626] text-white","A - Amazing":"bg-[#f97316] text-white","B - Great":"bg-[#eab308] text-white","C - Good":"bg-[#22c55e] text-white","D - Decent":"bg-[#06b6d4] text-white","E - Bad":"bg-[#6b7280] text-white"},bt={S:"S - Masterpiece",A:"A - Amazing",B:"B - Great",C:"C - Good",D:"D - Decent",E:"E - Bad"},Ot=e=>bt[e]||e;/**
 * @license lucide-svelte v0.552.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 * ---
 * 
 * The MIT License (MIT) (for portions derived from Feather)
 * 
 * Copyright (c) 2013-2023 Cole Bemis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */const ht={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};var pt=qe("<svg><!><!></svg>");function Q(e,r){const t=C(r,["children","$$slots","$$events","$$legacy"]),a=C(t,["name","color","size","strokeWidth","absoluteStrokeWidth","iconNode"]);He(r,!1);let i=G(r,"name",8,void 0),s=G(r,"color",8,"currentColor"),o=G(r,"size",8,24),n=G(r,"strokeWidth",8,2),l=G(r,"absoluteStrokeWidth",8,!1),d=G(r,"iconNode",24,()=>[]);const m=(...y)=>y.filter((S,h,D)=>!!S&&D.indexOf(S)===h).join(" ");pe();var c=pt();oe(c,(y,S)=>({...ht,...a,width:o(),height:o(),stroke:s(),"stroke-width":y,class:S}),[()=>(E(l()),E(n()),E(o()),Z(()=>l()?Number(n())*24/Number(o()):n())),()=>(E(i()),E(t),Z(()=>m("lucide-icon","lucide",i()?`lucide-${i()}`:"",t.class)))]);var f=je(c);Qe(f,1,d,Ze,(y,S)=>{var h=Ke(()=>Je(R(S),2));let D=()=>R(h)[0],M=()=>R(h)[1];var P=I(),p=B(P);it(p,D,!0,(T,u)=>{oe(T,()=>({...M()}))}),O(y,P)});var b=Ve(f);F(b,r,"default",{}),We(c),O(e,c),Ye()}function Ct(e,r){const t=C(r,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.552.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const a=[["line",{x1:"6",x2:"10",y1:"11",y2:"11"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"}]];Q(e,J({name:"gamepad-2"},()=>t,{get iconNode(){return a},children:(i,s)=>{var o=I(),n=B(o);F(n,r,"default",{}),O(i,o)},$$slots:{default:!0}}))}function Mt(e,r){const t=C(r,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.552.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const a=[["path",{d:"M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"}],["path",{d:"M2 6h4"}],["path",{d:"M2 10h4"}],["path",{d:"M2 14h4"}],["path",{d:"M2 18h4"}],["path",{d:"M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"}]];Q(e,J({name:"notebook-pen"},()=>t,{get iconNode(){return a},children:(i,s)=>{var o=I(),n=B(o);F(n,r,"default",{}),O(i,o)},$$slots:{default:!0}}))}function Tt(e,r){const t=C(r,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.552.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const a=[["path",{d:"M2 3h20"}],["path",{d:"M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"}],["path",{d:"m7 21 5-5 5 5"}]];Q(e,J({name:"presentation"},()=>t,{get iconNode(){return a},children:(i,s)=>{var o=I(),n=B(o);F(n,r,"default",{}),O(i,o)},$$slots:{default:!0}}))}function ne(e){return e.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim().replace(/^-|-$/g,"")}function St(){const e=Xe({isOpen:!1,activeGame:null,mode:"view",formData:{},validationErrors:{},isSubmitting:!1}),r=et(()=>{if(!(typeof window>"u"))try{const t=L(e),a=new URL(window.location.href);if(t.isOpen&&t.activeGame){const i=ne(t.activeGame.title);a.searchParams.set("game",i)}else a.searchParams.delete("game");tt(a.toString(),{})}catch(t){(!(t instanceof Error)||!t.message.includes("router is initialized"))&&console.warn("Failed to update URL:",t)}},100);return{subscribe:e.subscribe,getState(){return L(e)},openViewModal(t){e.set({isOpen:!0,activeGame:t,mode:"view",formData:{},validationErrors:{},isSubmitting:!1})},openEditModal(t){e.set({isOpen:!0,activeGame:t,mode:"edit",formData:{...t},validationErrors:{},isSubmitting:!1})},openAddModal(){e.set({isOpen:!0,activeGame:null,mode:"add",formData:{status:"Planned",coOp:"No"},validationErrors:{},isSubmitting:!1})},closeModal(){e.set({isOpen:!1,activeGame:null,mode:"view",formData:{},validationErrors:{},isSubmitting:!1})},toggleModal(){e.update(t=>({...t,isOpen:!t.isOpen}))},setActiveGame(t){e.update(a=>({...a,activeGame:t}))},setMode(t){e.update(a=>({...a,mode:t}))},updateFormData(t,a){e.update(i=>({...i,formData:{...i.formData,[t]:a},validationErrors:{...i.validationErrors,[t]:""}}))},resetForm(){e.update(t=>t.mode==="edit"&&t.activeGame?{...t,formData:{...t.activeGame},validationErrors:{},isSubmitting:!1}:{...t,formData:{status:"Planned",coOp:"No"},validationErrors:{},isSubmitting:!1})},validateForm(){const t=L(e),a={};return t.formData.title?.trim()||(a.title="Title is required"),t.formData.platform?.trim()||(a.platform="Platform is required"),t.formData.genre?.trim()||(a.genre="Genre is required"),t.formData.timeToBeat?.trim()||(a.timeToBeat="Time to beat is required"),t.formData.year!==void 0?(t.formData.year<1970||t.formData.year>2099)&&(a.year="Year must be between 1970 and 2099"):a.year="Year is required",t.formData.status==="Completed"&&(t.formData.hoursPlayed?.trim()||(a.hoursPlayed="Hours played is required for completed games"),t.formData.finishedDate||(a.finishedDate="Finished date is required for completed games"),(t.formData.ratingPresentation===null||t.formData.ratingPresentation===void 0)&&(a.ratingPresentation="Presentation rating is required for completed games"),(t.formData.ratingStory===null||t.formData.ratingStory===void 0)&&(a.ratingStory="Story rating is required for completed games"),(t.formData.ratingGameplay===null||t.formData.ratingGameplay===void 0)&&(a.ratingGameplay="Gameplay rating is required for completed games"),t.formData.ratingPresentation!==null&&t.formData.ratingPresentation!==void 0&&(t.formData.ratingPresentation<0||t.formData.ratingPresentation>10)&&(a.ratingPresentation="Presentation rating must be between 0 and 10"),t.formData.ratingStory!==null&&t.formData.ratingStory!==void 0&&(t.formData.ratingStory<0||t.formData.ratingStory>10)&&(a.ratingStory="Story rating must be between 0 and 10"),t.formData.ratingGameplay!==null&&t.formData.ratingGameplay!==void 0&&(t.formData.ratingGameplay<0||t.formData.ratingGameplay>10)&&(a.ratingGameplay="Gameplay rating must be between 0 and 10")),e.update(i=>({...i,validationErrors:a})),Object.keys(a).length===0},async submitForm(){const t=L(e);if(e.update(a=>({...a,isSubmitting:!0,validationErrors:{}})),!this.validateForm())return e.update(a=>({...a,isSubmitting:!1})),!1;try{if(t.mode==="add"){const a=t.formData.ratingPresentation??null,i=t.formData.ratingStory??null,s=t.formData.ratingGameplay??null,o=a!==null&&i!==null&&s!==null?Math.round((a+i+s)/3*2):null,n={...t.formData,id:crypto.randomUUID(),coverImage:`covers/${t.formData.title?.toLowerCase().replace(/[^a-z0-9]/g,"-")||"game"}.webp`,score:o,tier:t.formData.status==="Completed"&&o!==null?this.getTierFromScore(o):null};ee.addGame(n)}else if(t.mode==="edit"&&t.activeGame){const a=t.formData.ratingPresentation??null,i=t.formData.ratingStory??null,s=t.formData.ratingGameplay??null,o=a!==null&&i!==null&&s!==null?Math.round((a+i+s)/3*2):t.activeGame.score,n={...t.activeGame,...t.formData,score:o,tier:t.formData.status==="Completed"&&o!==null?this.getTierFromScore(o):t.formData.status==="Planned"?null:t.activeGame.tier};ee.updateGame(t.activeGame.id,n)}return this.closeModal(),!0}catch(a){return console.error("Error submitting form:",a),e.update(i=>({...i,isSubmitting:!1,validationErrors:{submit:"An error occurred while saving the game. Please try again."}})),!1}},getTierFromScore(t){return t>=18?"S":t>=15?"A":t>=12?"B":t>=9?"C":t>=6?"D":"E"},readFromURL(t,a){const i=t.get("game");if(i){let s=a.find(o=>ne(o.title)===i);s||(s=a.find(o=>o.id===i)),s&&e.set({isOpen:!0,activeGame:s,mode:"view",formData:{},validationErrors:{},isSubmitting:!1})}},writeToURL:r,handleEscape(){e.update(t=>t.isOpen?{...t,isOpen:!1}:t)}}}const xt=St();export{N as C,Ct as G,Q as I,Mt as N,Tt as P,$t as T,bt as a,F as b,z as c,ut as d,Et as e,Nt as f,Ot as g,oe as h,Gt as i,xt as m,gt as r,ct as s};
