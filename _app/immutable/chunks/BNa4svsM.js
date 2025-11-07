import"./DsnmJJEf.js";import{i as be}from"./CiQndsDT.js";import{k as v,l as V,aw as H,ax as he,m as K,E as pe,B as Se,ay as ye,az as _e,aA as we,aB as De,aC as Pe,O as R,N as U,a0 as Ae,U as ne,aD as x,aE as W,aF as fe,e as le,aG as Ge,aH as Ee,aI as Ne,aJ as Oe,aK as $e,aL as Me,q as Te,aM as Ce,aN as xe,aO as Le,i as k,aP as ke,aQ as Re,aR as ze,n as Ie,aS as Be,aT as Fe,aU as He,aV as Ue,p as qe,aW as je,d as Ve,ae as I,a as B,b as $,s as We,g as Ye,c as Ke,u as Z,H as E,j as Je,af as Xe,ac as Qe,T as L}from"./j0nRQgQ8.js";import{l as M,p as G,s as J}from"./DJ6p591i.js";import{e as Ze,i as et,d as tt,g as ee}from"./DTzPJak_.js";import{r as at}from"./CF2QQd4T.js";function F(t,r,e,a,i){v&&V();var s=r.$$slots?.[e],o=!1;s===!0&&(s=r.children,o=!0),s===void 0||s(t,o?()=>a:a)}function rt(t,r,e,a,i,s){let o=v;v&&V();var n=null;v&&H.nodeType===he&&(n=H,V());var l=v?H:t,d=new Se(l,!1);K(()=>{const m=r()||null;var c=ye;if(m===null){d.ensure(null,null),x(!0);return}return d.ensure(m,f=>{if(m){if(n=v?n:document.createElementNS(c,m),_e(n,n),a){v&&we(m)&&n.append(document.createComment(""));var b=v?De(n):n.appendChild(Pe());v&&(b===null?R(!1):U(b)),a(n,b)}Ae.nodes_end=n,f.before(n)}v&&U(f)}),x(!0),()=>{m&&x(!1)}},pe),ne(()=>{x(!0)}),o&&(R(!0),U(l))}function it(t,r){var e=void 0,a;K(()=>{e!==(e=r())&&(a&&(W(a),a=null),e&&(a=fe(()=>{le(()=>e(t))})))})}function ue(t){var r,e,a="";if(typeof t=="string"||typeof t=="number")a+=t;else if(typeof t=="object")if(Array.isArray(t)){var i=t.length;for(r=0;r<i;r++)t[r]&&(e=ue(t[r]))&&(a&&(a+=" "),a+=e)}else for(e in t)t[e]&&(a&&(a+=" "),a+=e);return a}function ot(){for(var t,r,e=0,a="",i=arguments.length;e<i;e++)(t=arguments[e])&&(r=ue(t))&&(a&&(a+=" "),a+=r);return a}function st(t){return typeof t=="object"?ot(t):t??""}const te=[...` 	
\r\f \v\uFEFF`];function nt(t,r,e){var a=t==null?"":""+t;if(r&&(a=a?a+" "+r:r),e){for(var i in e)if(e[i])a=a?a+" "+i:i;else if(a.length)for(var s=i.length,o=0;(o=a.indexOf(i,o))>=0;){var n=o+s;(o===0||te.includes(a[o-1]))&&(n===a.length||te.includes(a[n]))?a=(o===0?"":a.substring(0,o))+a.substring(n+1):o=n}}return a===""?null:a}function ae(t,r=!1){var e=r?" !important;":";",a="";for(var i in t){var s=t[i];s!=null&&s!==""&&(a+=" "+i+": "+s+e)}return a}function q(t){return t[0]!=="-"||t[1]!=="-"?t.toLowerCase():t}function ft(t,r){if(r){var e="",a,i;if(Array.isArray(r)?(a=r[0],i=r[1]):a=r,t){t=String(t).replaceAll(/\s*\/\*.*?\*\/\s*/g,"").trim();var s=!1,o=0,n=!1,l=[];a&&l.push(...Object.keys(a).map(q)),i&&l.push(...Object.keys(i).map(q));var d=0,m=-1;const S=t.length;for(var c=0;c<S;c++){var f=t[c];if(n?f==="/"&&t[c-1]==="*"&&(n=!1):s?s===f&&(s=!1):f==="/"&&t[c+1]==="*"?n=!0:f==='"'||f==="'"?s=f:f==="("?o++:f===")"&&o--,!n&&s===!1&&o===0){if(f===":"&&m===-1)m=c;else if(f===";"||c===S-1){if(m!==-1){var b=q(t.substring(d,m).trim());if(!l.includes(b)){f!==";"&&c++;var _=t.substring(d,c).trim();e+=" "+_+";"}}d=c+1,m=-1}}}}return a&&(e+=ae(a)),i&&(e+=ae(i,!0)),e=e.trim(),e===""?null:e}return t==null?null:String(t)}function lt(t,r,e,a,i,s){var o=t.__className;if(v||o!==e||o===void 0){var n=nt(e,a,s);(!v||n!==t.getAttribute("class"))&&(n==null?t.removeAttribute("class"):r?t.className=n:t.setAttribute("class",n)),t.__className=e}else if(s&&i!==s)for(var l in s){var d=!!s[l];(i==null||d!==!!i[l])&&t.classList.toggle(l,d)}return s}function j(t,r={},e,a){for(var i in e){var s=e[i];r[i]!==s&&(e[i]==null?t.style.removeProperty(i):t.style.setProperty(i,s,a))}}function ut(t,r,e,a){var i=t.__style;if(v||i!==r){var s=ft(r,a);(!v||s!==t.getAttribute("style"))&&(s==null?t.removeAttribute("style"):t.style.cssText=s),t.__style=r}else a&&(Array.isArray(a)?(j(t,e?.[0],a[0]),j(t,e?.[1],a[1],"important")):j(t,e,a));return a}function Y(t,r,e=!1){if(t.multiple){if(r==null)return;if(!Ge(r))return Ee();for(var a of t.options)a.selected=r.includes(re(a));return}for(a of t.options){var i=re(a);if(Ne(i,r)){a.selected=!0;return}}(!e||r!==void 0)&&(t.selectedIndex=-1)}function ct(t){var r=new MutationObserver(()=>{Y(t,t.__value)});r.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),ne(()=>{r.disconnect()})}function re(t){return"__value"in t?t.__value:t.value}const N=Symbol("class"),O=Symbol("style"),ce=Symbol("is custom element"),de=Symbol("is html");function dt(t){if(v){var r=!1,e=()=>{if(!r){if(r=!0,t.hasAttribute("value")){var a=t.value;z(t,"value",null),t.value=a}if(t.hasAttribute("checked")){var i=t.checked;z(t,"checked",null),t.checked=i}}};t.__on_r=e,Te(e),Ce()}}function At(t,r){var e=X(t);e.value===(e.value=r??void 0)||t.value===r&&(r!==0||t.nodeName!=="PROGRESS")||(t.value=r??"")}function gt(t,r){r?t.hasAttribute("selected")||t.setAttribute("selected",""):t.removeAttribute("selected")}function z(t,r,e,a){var i=X(t);v&&(i[r]=t.getAttribute(r),r==="src"||r==="srcset"||r==="href"&&t.nodeName==="LINK")||i[r]!==(i[r]=e)&&(r==="loading"&&(t[Oe]=e),e==null?t.removeAttribute(r):typeof e!="string"&&ge(t).includes(r)?t[r]=e:t.setAttribute(r,e))}function mt(t,r,e,a,i=!1,s=!1){if(v&&i&&t.tagName==="INPUT"){var o=t,n=o.type==="checkbox"?"defaultChecked":"defaultValue";n in e||dt(o)}var l=X(t),d=l[ce],m=!l[de];let c=v&&d;c&&R(!1);var f=r||{},b=t.tagName==="OPTION";for(var _ in r)_ in e||(e[_]=null);e.class?e.class=st(e.class):(a||e[N])&&(e.class=null),e[O]&&(e.style??=null);var S=ge(t);for(const u in e){let g=e[u];if(b&&u==="value"&&g==null){t.value=t.__value="",f[u]=g;continue}if(u==="class"){var h=t.namespaceURI==="http://www.w3.org/1999/xhtml";lt(t,h,g,a,r?.[N],e[N]),f[u]=g,f[N]=e[N];continue}if(u==="style"){ut(t,g,r?.[O],e[O]),f[u]=g,f[O]=e[O];continue}var D=f[u];if(!(g===D&&!(g===void 0&&t.hasAttribute(u)))){f[u]=g;var T=u[0]+u[1];if(T!=="$$")if(T==="on"){const w={},A="$$"+u;let y=u.slice(2);var P=Ue(y);if(Re(y)&&(y=y.slice(0,-7),w.capture=!0),!P&&D){if(g!=null)continue;t.removeEventListener(y,f[A],w),f[A]=null}if(g!=null)if(P)t[`__${y}`]=g,Ie([y]);else{let me=function(ve){f[u].call(this,ve)};f[A]=ze(y,t,me,w)}else P&&(t[`__${y}`]=void 0)}else if(u==="style")z(t,u,g);else if(u==="autofocus")Be(t,!!g);else if(!d&&(u==="__value"||u==="value"&&g!=null))t.value=t.__value=g;else if(u==="selected"&&b)gt(t,g);else{var p=u;m||(p=Fe(p));var C=p==="defaultValue"||p==="defaultChecked";if(g==null&&!d&&!C)if(l[u]=null,p==="value"||p==="checked"){let w=t;const A=r===void 0;if(p==="value"){let y=w.defaultValue;w.removeAttribute(p),w.defaultValue=y,w.value=w.__value=A?y:null}else{let y=w.defaultChecked;w.removeAttribute(p),w.defaultChecked=y,w.checked=A?y:!1}}else t.removeAttribute(u);else C||S.includes(p)&&(d||typeof g!="string")?(t[p]=g,p in l&&(l[p]=He)):typeof g!="function"&&z(t,p,g)}}}return c&&R(!0),f}function ie(t,r,e=[],a=[],i,s=!1,o=!1){Le(e,a,n=>{var l=void 0,d={},m=t.nodeName==="SELECT",c=!1;if(K(()=>{var b=r(...n.map(k)),_=mt(t,l,b,i,s,o);c&&m&&"value"in b&&Y(t,b.value);for(let h of Object.getOwnPropertySymbols(d))b[h]||W(d[h]);for(let h of Object.getOwnPropertySymbols(b)){var S=b[h];h.description===ke&&(!l||S!==l[h])&&(d[h]&&W(d[h]),d[h]=fe(()=>it(t,()=>S))),_[h]=S}l=_}),m){var f=t;le(()=>{Y(f,l.value,!0),ct(f)})}c=!0})}function X(t){return t.__attributes??={[ce]:t.nodeName.includes("-"),[de]:t.namespaceURI===$e}}var oe=new Map;function ge(t){var r=t.getAttribute("is")||t.nodeName,e=oe.get(r);if(e)return e;oe.set(r,e=[]);for(var a,i=t,s=Element.prototype;s!==i;){a=xe(i);for(var o in a)a[o].set&&e.push(o);i=Me(i)}return e}const Gt={PC:"bg-[#1e40af] text-white",PS4:"bg-[#f59e0b] text-[#fef3c7]",PS3:"bg-[#ef4444] text-[#fecaca]",PS2:"bg-[#a855f7] text-[#e9d5ff]",PS1:"bg-[#f97316] text-white",Switch:"bg-[#22c55e] text-[#dcfce7]","3DS":"bg-[#ec4899] text-[#fce7f3]",N64:"bg-[#7c3aed] text-white",GameCube:"bg-[#06b6d4] text-[#cffafe]","Game Boy Advance":"bg-[#dc2626] text-[#fca5a5]",Xbox:"bg-[#166534] text-[#dcfce7]","Xbox 360":"bg-[#65a30d] text-[#f7f9e3]",Dreamcast:"bg-[#0d9488] text-[#ccfbf1]"},Et={Platformer:"bg-[#dc2626] text-white","Action Platformer":"bg-[#7f1d1d] text-white","Puzzle Platformer":"bg-[#7c3aed] text-white","Story Platformer":"bg-[#ea580c] text-white","Story Adventure":"bg-[#92400e] text-white","Action Adventure":"bg-[#0d9488] text-white","Survival Horror":"bg-[#581c87] text-white","Story Puzzle":"bg-[#be185d] text-white",Puzzle:"bg-[#15803d] text-white","Action RPG":"bg-[#b91c1c] text-white","Classic RPG":"bg-[#7c2d12] text-white","Japanese RPG":"bg-[#0891b2] text-white","Sandbox RPG":"bg-[#4d7c0f] text-white","Story RPG":"bg-[#be123c] text-white",FPS:"bg-[#991b1b] text-white",Action:"bg-[#9a3412] text-white","Bullet Hell":"bg-[#dc143c] text-white","Hack & Slash":"bg-[#c2410c] text-white",Survival:"bg-[#166534] text-white",Strategy:"bg-[#1e40af] text-white",Metroidvania:"bg-[#6b21a8] text-white",Roguelike:"bg-[#f97316] text-white","Story Horror":"bg-[#4c1d95] text-white","Horror RPG":"bg-[#0f172a] text-white"},Nt={"S - Masterpiece":"bg-[#dc2626] text-white","A - Amazing":"bg-[#f97316] text-white","B - Great":"bg-[#eab308] text-white","C - Good":"bg-[#22c55e] text-white","D - Decent":"bg-[#06b6d4] text-white","E - Bad":"bg-[#6b7280] text-white"},vt={S:"S - Masterpiece",A:"A - Amazing",B:"B - Great",C:"C - Good",D:"D - Decent",E:"E - Bad"},Ot=t=>vt[t]||t;/**
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
 */const bt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};var ht=je("<svg><!><!></svg>");function Q(t,r){const e=M(r,["children","$$slots","$$events","$$legacy"]),a=M(e,["name","color","size","strokeWidth","absoluteStrokeWidth","iconNode"]);qe(r,!1);let i=G(r,"name",8,void 0),s=G(r,"color",8,"currentColor"),o=G(r,"size",8,24),n=G(r,"strokeWidth",8,2),l=G(r,"absoluteStrokeWidth",8,!1),d=G(r,"iconNode",24,()=>[]);const m=(..._)=>_.filter((S,h,D)=>!!S&&D.indexOf(S)===h).join(" ");be();var c=ht();ie(c,(_,S)=>({...bt,...a,width:o(),height:o(),stroke:s(),"stroke-width":_,class:S}),[()=>(E(l()),E(n()),E(o()),Z(()=>l()?Number(n())*24/Number(o()):n())),()=>(E(i()),E(e),Z(()=>m("lucide-icon","lucide",i()?`lucide-${i()}`:"",e.class)))]);var f=Ve(c);Ze(f,1,d,et,(_,S)=>{var h=Je(()=>Xe(k(S),2));let D=()=>k(h)[0],T=()=>k(h)[1];var P=I(),p=B(P);rt(p,D,!0,(C,u)=>{ie(C,()=>({...T()}))}),$(_,P)});var b=We(f);F(b,r,"default",{}),Ye(c),$(t,c),Ke()}function $t(t,r){const e=M(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const a=[["line",{x1:"6",x2:"10",y1:"11",y2:"11"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"}]];Q(t,J({name:"gamepad-2"},()=>e,{get iconNode(){return a},children:(i,s)=>{var o=I(),n=B(o);F(n,r,"default",{}),$(i,o)},$$slots:{default:!0}}))}function Mt(t,r){const e=M(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const a=[["path",{d:"M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"}],["path",{d:"M2 6h4"}],["path",{d:"M2 10h4"}],["path",{d:"M2 14h4"}],["path",{d:"M2 18h4"}],["path",{d:"M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"}]];Q(t,J({name:"notebook-pen"},()=>e,{get iconNode(){return a},children:(i,s)=>{var o=I(),n=B(o);F(n,r,"default",{}),$(i,o)},$$slots:{default:!0}}))}function Tt(t,r){const e=M(r,["children","$$slots","$$events","$$legacy"]);/**
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
 */const a=[["path",{d:"M2 3h20"}],["path",{d:"M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"}],["path",{d:"m7 21 5-5 5 5"}]];Q(t,J({name:"presentation"},()=>e,{get iconNode(){return a},children:(i,s)=>{var o=I(),n=B(o);F(n,r,"default",{}),$(i,o)},$$slots:{default:!0}}))}function se(t){return t.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim().replace(/^-|-$/g,"")}function pt(){const t=Qe({isOpen:!1,activeGame:null,mode:"view",formData:{},validationErrors:{},isSubmitting:!1}),r=tt(()=>{if(!(typeof window>"u"))try{const e=L(t),a=new URL(window.location.href);if(e.isOpen&&e.activeGame){const i=se(e.activeGame.title);a.searchParams.set("game",i)}else a.searchParams.delete("game");at(a.toString(),{})}catch(e){(!(e instanceof Error)||!e.message.includes("router is initialized"))&&console.warn("Failed to update URL:",e)}},100);return{subscribe:t.subscribe,getState(){return L(t)},openViewModal(e){t.set({isOpen:!0,activeGame:e,mode:"view",formData:{},validationErrors:{},isSubmitting:!1})},openEditModal(e){t.set({isOpen:!0,activeGame:e,mode:"edit",formData:{...e},validationErrors:{},isSubmitting:!1})},openAddModal(){t.set({isOpen:!0,activeGame:null,mode:"add",formData:{status:"Planned",coOp:"No"},validationErrors:{},isSubmitting:!1})},closeModal(){t.set({isOpen:!1,activeGame:null,mode:"view",formData:{},validationErrors:{},isSubmitting:!1})},toggleModal(){t.update(e=>({...e,isOpen:!e.isOpen}))},setActiveGame(e){t.update(a=>({...a,activeGame:e}))},setMode(e){t.update(a=>({...a,mode:e}))},updateFormData(e,a){t.update(i=>({...i,formData:{...i.formData,[e]:a},validationErrors:{...i.validationErrors,[e]:""}}))},resetForm(){t.update(e=>e.mode==="edit"&&e.activeGame?{...e,formData:{...e.activeGame},validationErrors:{},isSubmitting:!1}:{...e,formData:{status:"Planned",coOp:"No"},validationErrors:{},isSubmitting:!1})},validateForm(){const e=L(t),a={};return e.formData.title?.trim()||(a.title="Title is required"),e.formData.platform?.trim()||(a.platform="Platform is required"),e.formData.genre?.trim()||(a.genre="Genre is required"),e.formData.timeToBeat?.trim()||(a.timeToBeat="Time to beat is required"),e.formData.year!==void 0?(e.formData.year<1970||e.formData.year>2099)&&(a.year="Year must be between 1970 and 2099"):a.year="Year is required",e.formData.status==="Completed"&&(e.formData.hoursPlayed?.trim()||(a.hoursPlayed="Hours played is required for completed games"),e.formData.finishedDate||(a.finishedDate="Finished date is required for completed games"),(e.formData.ratingPresentation===null||e.formData.ratingPresentation===void 0)&&(a.ratingPresentation="Presentation rating is required for completed games"),(e.formData.ratingStory===null||e.formData.ratingStory===void 0)&&(a.ratingStory="Story rating is required for completed games"),(e.formData.ratingGameplay===null||e.formData.ratingGameplay===void 0)&&(a.ratingGameplay="Gameplay rating is required for completed games"),e.formData.ratingPresentation!==null&&e.formData.ratingPresentation!==void 0&&(e.formData.ratingPresentation<0||e.formData.ratingPresentation>10)&&(a.ratingPresentation="Presentation rating must be between 0 and 10"),e.formData.ratingStory!==null&&e.formData.ratingStory!==void 0&&(e.formData.ratingStory<0||e.formData.ratingStory>10)&&(a.ratingStory="Story rating must be between 0 and 10"),e.formData.ratingGameplay!==null&&e.formData.ratingGameplay!==void 0&&(e.formData.ratingGameplay<0||e.formData.ratingGameplay>10)&&(a.ratingGameplay="Gameplay rating must be between 0 and 10")),t.update(i=>({...i,validationErrors:a})),Object.keys(a).length===0},async submitForm(){const e=L(t);if(t.update(a=>({...a,isSubmitting:!0,validationErrors:{}})),!this.validateForm())return t.update(a=>({...a,isSubmitting:!1})),!1;try{if(e.mode==="add"){const a=e.formData.ratingPresentation??null,i=e.formData.ratingStory??null,s=e.formData.ratingGameplay??null,o=a!==null&&i!==null&&s!==null?Math.round((a+i+s)/3*2):null,n={...e.formData,id:crypto.randomUUID(),coverImage:`covers/${e.formData.title?.toLowerCase().replace(/[^a-z0-9]/g,"-")||"game"}.webp`,score:o,tier:e.formData.status==="Completed"&&o!==null?this.getTierFromScore(o):null};ee.addGame(n)}else if(e.mode==="edit"&&e.activeGame){const a=e.formData.ratingPresentation??null,i=e.formData.ratingStory??null,s=e.formData.ratingGameplay??null,o=a!==null&&i!==null&&s!==null?Math.round((a+i+s)/3*2):e.activeGame.score,n={...e.activeGame,...e.formData,score:o,tier:e.formData.status==="Completed"&&o!==null?this.getTierFromScore(o):e.formData.status==="Planned"?null:e.activeGame.tier};ee.updateGame(e.activeGame.id,n)}return this.closeModal(),!0}catch(a){return console.error("Error submitting form:",a),t.update(i=>({...i,isSubmitting:!1,validationErrors:{submit:"An error occurred while saving the game. Please try again."}})),!1}},getTierFromScore(e){return e>=18?"S":e>=15?"A":e>=12?"B":e>=9?"C":e>=6?"D":"E"},readFromURL(e,a){const i=e.get("game");if(i){let s=a.find(o=>se(o.title)===i);s||(s=a.find(o=>o.id===i)),s&&t.set({isOpen:!0,activeGame:s,mode:"view",formData:{},validationErrors:{},isSubmitting:!1})}},writeToURL:r,handleEscape(){t.update(e=>e.isOpen?{...e,isOpen:!1}:e)}}}const Ct=pt();export{N as C,$t as G,Q as I,Mt as N,Tt as P,Nt as T,vt as a,F as b,ut as c,z as d,Gt as e,Et as f,Ot as g,ie as h,At as i,Ct as m,dt as r,lt as s};
