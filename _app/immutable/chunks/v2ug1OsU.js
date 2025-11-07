import"./DsnmJJEf.js";import{i as he}from"./C5VE4AoD.js";import{q as ne,y as v,z as j,ar as F,as as pe,A as Y,E as Se,B as _e,at as ye,au as we,av as De,aw as Pe,ax as Ae,V as k,U as H,a2 as Ge,Y as fe,ay as V,az as le,e as ue,aA as Ee,aB as Ne,aC as $e,aD as Oe,aE as Ce,aF as Me,aG as xe,aH as Te,j as L,aI as Le,aJ as ke,aK as Re,C as ze,aL as Ie,aM as Be,aN as Fe,p as He,aO as qe,d as Ue,i as z,a as I,b as O,s as je,g as Ve,c as We,u as Z,m as E,ag as Ye,ah as Ke,w as Je,x as T}from"./DTj0cNIF.js";import{l as C,p as G,s as K}from"./B2Cll8NP.js";import{e as Xe,i as Ze,g as Q}from"./DVqzFcWJ.js";import{r as Qe}from"./Bg_8vgeG.js";function et(t,e){if(e){const a=document.body;t.autofocus=!0,ne(()=>{document.activeElement===a&&t.focus()})}}let ee=!1;function tt(){ee||(ee=!0,document.addEventListener("reset",t=>{Promise.resolve().then(()=>{if(!t.defaultPrevented)for(const e of t.target.elements)e.__on_r?.()})},{capture:!0}))}function B(t,e,a,r,i){v&&j();var o=e.$$slots?.[a],s=!1;o===!0&&(o=e.children,s=!0),o===void 0||o(t,s?()=>r:r)}function at(t,e,a,r,i,o){let s=v;v&&j();var n=null;v&&F.nodeType===pe&&(n=F,j());var l=v?F:t,d=new _e(l,!1);Y(()=>{const m=e()||null;var c=ye;if(m===null){d.ensure(null,null);return}return d.ensure(m,f=>{if(m){if(n=v?n:document.createElementNS(c,m),we(n,n),r){v&&De(m)&&n.append(document.createComment(""));var b=v?Pe(n):n.appendChild(Ae());v&&(b===null?k(!1):H(b)),r(n,b)}Ge.nodes_end=n,f.before(n)}v&&H(f)}),()=>{}},Se),fe(()=>{}),s&&(k(!0),H(l))}function rt(t,e){var a=void 0,r;Y(()=>{a!==(a=e())&&(r&&(V(r),r=null),a&&(r=le(()=>{ue(()=>a(t))})))})}function ce(t){var e,a,r="";if(typeof t=="string"||typeof t=="number")r+=t;else if(typeof t=="object")if(Array.isArray(t)){var i=t.length;for(e=0;e<i;e++)t[e]&&(a=ce(t[e]))&&(r&&(r+=" "),r+=a)}else for(a in t)t[a]&&(r&&(r+=" "),r+=a);return r}function it(){for(var t,e,a=0,r="",i=arguments.length;a<i;a++)(t=arguments[a])&&(e=ce(t))&&(r&&(r+=" "),r+=e);return r}function ot(t){return typeof t=="object"?it(t):t??""}const te=[...` 	
\r\f \v\uFEFF`];function st(t,e,a){var r=t==null?"":""+t;if(e&&(r=r?r+" "+e:e),a){for(var i in a)if(a[i])r=r?r+" "+i:i;else if(r.length)for(var o=i.length,s=0;(s=r.indexOf(i,s))>=0;){var n=s+o;(s===0||te.includes(r[s-1]))&&(n===r.length||te.includes(r[n]))?r=(s===0?"":r.substring(0,s))+r.substring(n+1):s=n}}return r===""?null:r}function ae(t,e=!1){var a=e?" !important;":";",r="";for(var i in t){var o=t[i];o!=null&&o!==""&&(r+=" "+i+": "+o+a)}return r}function q(t){return t[0]!=="-"||t[1]!=="-"?t.toLowerCase():t}function nt(t,e){if(e){var a="",r,i;if(Array.isArray(e)?(r=e[0],i=e[1]):r=e,t){t=String(t).replaceAll(/\s*\/\*.*?\*\/\s*/g,"").trim();var o=!1,s=0,n=!1,l=[];r&&l.push(...Object.keys(r).map(q)),i&&l.push(...Object.keys(i).map(q));var d=0,m=-1;const S=t.length;for(var c=0;c<S;c++){var f=t[c];if(n?f==="/"&&t[c-1]==="*"&&(n=!1):o?o===f&&(o=!1):f==="/"&&t[c+1]==="*"?n=!0:f==='"'||f==="'"?o=f:f==="("?s++:f===")"&&s--,!n&&o===!1&&s===0){if(f===":"&&m===-1)m=c;else if(f===";"||c===S-1){if(m!==-1){var b=q(t.substring(d,m).trim());if(!l.includes(b)){f!==";"&&c++;var y=t.substring(d,c).trim();a+=" "+y+";"}}d=c+1,m=-1}}}}return r&&(a+=ae(r)),i&&(a+=ae(i,!0)),a=a.trim(),a===""?null:a}return t==null?null:String(t)}function ft(t,e,a,r,i,o){var s=t.__className;if(v||s!==a||s===void 0){var n=st(a,r,o);(!v||n!==t.getAttribute("class"))&&(n==null?t.removeAttribute("class"):e?t.className=n:t.setAttribute("class",n)),t.__className=a}else if(o&&i!==o)for(var l in o){var d=!!o[l];(i==null||d!==!!i[l])&&t.classList.toggle(l,d)}return o}function U(t,e={},a,r){for(var i in a){var o=a[i];e[i]!==o&&(a[i]==null?t.style.removeProperty(i):t.style.setProperty(i,o,r))}}function lt(t,e,a,r){var i=t.__style;if(v||i!==e){var o=nt(e,r);(!v||o!==t.getAttribute("style"))&&(o==null?t.removeAttribute("style"):t.style.cssText=o),t.__style=e}else r&&(Array.isArray(r)?(U(t,a?.[0],r[0]),U(t,a?.[1],r[1],"important")):U(t,a,r));return r}function W(t,e,a=!1){if(t.multiple){if(e==null)return;if(!Ee(e))return Ne();for(var r of t.options)r.selected=e.includes(re(r));return}for(r of t.options){var i=re(r);if($e(i,e)){r.selected=!0;return}}(!a||e!==void 0)&&(t.selectedIndex=-1)}function ut(t){var e=new MutationObserver(()=>{W(t,t.__value)});e.observe(t,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),fe(()=>{e.disconnect()})}function re(t){return"__value"in t?t.__value:t.value}const N=Symbol("class"),$=Symbol("style"),de=Symbol("is custom element"),ge=Symbol("is html");function ct(t){if(v){var e=!1,a=()=>{if(!e){if(e=!0,t.hasAttribute("value")){var r=t.value;R(t,"value",null),t.value=r}if(t.hasAttribute("checked")){var i=t.checked;R(t,"checked",null),t.checked=i}}};t.__on_r=a,ne(a),tt()}}function Pt(t,e){var a=J(t);a.value===(a.value=e??void 0)||t.value===e&&(e!==0||t.nodeName!=="PROGRESS")||(t.value=e??"")}function dt(t,e){e?t.hasAttribute("selected")||t.setAttribute("selected",""):t.removeAttribute("selected")}function R(t,e,a,r){var i=J(t);v&&(i[e]=t.getAttribute(e),e==="src"||e==="srcset"||e==="href"&&t.nodeName==="LINK")||i[e]!==(i[e]=a)&&(e==="loading"&&(t[Oe]=a),a==null?t.removeAttribute(e):typeof a!="string"&&me(t).includes(e)?t[e]=a:t.setAttribute(e,a))}function gt(t,e,a,r,i=!1,o=!1){if(v&&i&&t.tagName==="INPUT"){var s=t,n=s.type==="checkbox"?"defaultChecked":"defaultValue";n in a||ct(s)}var l=J(t),d=l[de],m=!l[ge];let c=v&&d;c&&k(!1);var f=e||{},b=t.tagName==="OPTION";for(var y in e)y in a||(a[y]=null);a.class?a.class=ot(a.class):(r||a[N])&&(a.class=null),a[$]&&(a.style??=null);var S=me(t);for(const u in a){let g=a[u];if(b&&u==="value"&&g==null){t.value=t.__value="",f[u]=g;continue}if(u==="class"){var h=t.namespaceURI==="http://www.w3.org/1999/xhtml";ft(t,h,g,r,e?.[N],a[N]),f[u]=g,f[N]=a[N];continue}if(u==="style"){lt(t,g,e?.[$],a[$]),f[u]=g,f[$]=a[$];continue}var D=f[u];if(!(g===D&&!(g===void 0&&t.hasAttribute(u)))){f[u]=g;var M=u[0]+u[1];if(M!=="$$")if(M==="on"){const w={},A="$$"+u;let _=u.slice(2);var P=Fe(_);if(ke(_)&&(_=_.slice(0,-7),w.capture=!0),!P&&D){if(g!=null)continue;t.removeEventListener(_,f[A],w),f[A]=null}if(g!=null)if(P)t[`__${_}`]=g,ze([_]);else{let ve=function(be){f[u].call(this,be)};f[A]=Re(_,t,ve,w)}else P&&(t[`__${_}`]=void 0)}else if(u==="style")R(t,u,g);else if(u==="autofocus")et(t,!!g);else if(!d&&(u==="__value"||u==="value"&&g!=null))t.value=t.__value=g;else if(u==="selected"&&b)dt(t,g);else{var p=u;m||(p=Ie(p));var x=p==="defaultValue"||p==="defaultChecked";if(g==null&&!d&&!x)if(l[u]=null,p==="value"||p==="checked"){let w=t;const A=e===void 0;if(p==="value"){let _=w.defaultValue;w.removeAttribute(p),w.defaultValue=_,w.value=w.__value=A?_:null}else{let _=w.defaultChecked;w.removeAttribute(p),w.defaultChecked=_,w.checked=A?_:!1}}else t.removeAttribute(u);else x||S.includes(p)&&(d||typeof g!="string")?(t[p]=g,p in l&&(l[p]=Be)):typeof g!="function"&&R(t,p,g)}}}return c&&k(!0),f}function ie(t,e,a=[],r=[],i,o=!1,s=!1){Te(a,r,n=>{var l=void 0,d={},m=t.nodeName==="SELECT",c=!1;if(Y(()=>{var b=e(...n.map(L)),y=gt(t,l,b,i,o,s);c&&m&&"value"in b&&W(t,b.value);for(let h of Object.getOwnPropertySymbols(d))b[h]||V(d[h]);for(let h of Object.getOwnPropertySymbols(b)){var S=b[h];h.description===Le&&(!l||S!==l[h])&&(d[h]&&V(d[h]),d[h]=le(()=>rt(t,()=>S))),y[h]=S}l=y}),m){var f=t;ue(()=>{W(f,l.value,!0),ut(f)})}c=!0})}function J(t){return t.__attributes??={[de]:t.nodeName.includes("-"),[ge]:t.namespaceURI===Ce}}var oe=new Map;function me(t){var e=t.getAttribute("is")||t.nodeName,a=oe.get(e);if(a)return a;oe.set(e,a=[]);for(var r,i=t,o=Element.prototype;o!==i;){r=xe(i);for(var s in r)r[s].set&&a.push(s);i=Me(i)}return a}const At={PC:"bg-[#1e40af] text-white",PS4:"bg-[#f59e0b] text-[#fef3c7]",PS3:"bg-[#ef4444] text-[#fecaca]",PS2:"bg-[#a855f7] text-[#e9d5ff]",PS1:"bg-[#f97316] text-white",Switch:"bg-[#22c55e] text-[#dcfce7]","3DS":"bg-[#ec4899] text-[#fce7f3]",N64:"bg-[#7c3aed] text-white",GameCube:"bg-[#06b6d4] text-[#cffafe]","Game Boy Advance":"bg-[#dc2626] text-[#fca5a5]",Xbox:"bg-[#166534] text-[#dcfce7]","Xbox 360":"bg-[#65a30d] text-[#f7f9e3]",Dreamcast:"bg-[#0d9488] text-[#ccfbf1]"},Gt={Platformer:"bg-[#dc2626] text-white","Action Platformer":"bg-[#7f1d1d] text-white","Puzzle Platformer":"bg-[#7c3aed] text-white","Story Platformer":"bg-[#ea580c] text-white","Story Adventure":"bg-[#92400e] text-white","Action Adventure":"bg-[#0d9488] text-white","Survival Horror":"bg-[#581c87] text-white","Story Puzzle":"bg-[#be185d] text-white",Puzzle:"bg-[#15803d] text-white","Action RPG":"bg-[#b91c1c] text-white","Classic RPG":"bg-[#7c2d12] text-white","Japanese RPG":"bg-[#0891b2] text-white","Sandbox RPG":"bg-[#4d7c0f] text-white","Story RPG":"bg-[#be123c] text-white",FPS:"bg-[#991b1b] text-white",Action:"bg-[#9a3412] text-white","Bullet Hell":"bg-[#dc143c] text-white","Hack & Slash":"bg-[#c2410c] text-white",Survival:"bg-[#166534] text-white",Strategy:"bg-[#1e40af] text-white",Metroidvania:"bg-[#6b21a8] text-white",Roguelike:"bg-[#f97316] text-white","Story Horror":"bg-[#4c1d95] text-white","Horror RPG":"bg-[#0f172a] text-white"},Et={"S - Masterpiece":"bg-[#dc2626] text-white","A - Amazing":"bg-[#f97316] text-white","B - Great":"bg-[#eab308] text-white","C - Good":"bg-[#22c55e] text-white","D - Decent":"bg-[#06b6d4] text-white","E - Bad":"bg-[#6b7280] text-white"},mt={S:"S - Masterpiece",A:"A - Amazing",B:"B - Great",C:"C - Good",D:"D - Decent",E:"E - Bad"},Nt=t=>mt[t]||t;/**
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
 */const vt={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};var bt=qe("<svg><!><!></svg>");function X(t,e){const a=C(e,["children","$$slots","$$events","$$legacy"]),r=C(a,["name","color","size","strokeWidth","absoluteStrokeWidth","iconNode"]);He(e,!1);let i=G(e,"name",8,void 0),o=G(e,"color",8,"currentColor"),s=G(e,"size",8,24),n=G(e,"strokeWidth",8,2),l=G(e,"absoluteStrokeWidth",8,!1),d=G(e,"iconNode",24,()=>[]);const m=(...y)=>y.filter((S,h,D)=>!!S&&D.indexOf(S)===h).join(" ");he();var c=bt();ie(c,(y,S)=>({...vt,...r,width:s(),height:s(),stroke:o(),"stroke-width":y,class:S}),[()=>(E(l()),E(n()),E(s()),Z(()=>l()?Number(n())*24/Number(s()):n())),()=>(E(i()),E(a),Z(()=>m("lucide-icon","lucide",i()?`lucide-${i()}`:"",a.class)))]);var f=Ue(c);Xe(f,1,d,Ze,(y,S)=>{var h=Ye(()=>Ke(L(S),2));let D=()=>L(h)[0],M=()=>L(h)[1];var P=z(),p=I(P);at(p,D,!0,(x,u)=>{ie(x,()=>({...M()}))}),O(y,P)});var b=je(f);B(b,e,"default",{}),Ve(c),O(t,c),We()}function $t(t,e){const a=C(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["line",{x1:"6",x2:"10",y1:"11",y2:"11"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"}]];X(t,K({name:"gamepad-2"},()=>a,{get iconNode(){return r},children:(i,o)=>{var s=z(),n=I(s);B(n,e,"default",{}),O(i,s)},$$slots:{default:!0}}))}function Ot(t,e){const a=C(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"}],["path",{d:"M2 6h4"}],["path",{d:"M2 10h4"}],["path",{d:"M2 14h4"}],["path",{d:"M2 18h4"}],["path",{d:"M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"}]];X(t,K({name:"notebook-pen"},()=>a,{get iconNode(){return r},children:(i,o)=>{var s=z(),n=I(s);B(n,e,"default",{}),O(i,s)},$$slots:{default:!0}}))}function Ct(t,e){const a=C(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M2 3h20"}],["path",{d:"M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"}],["path",{d:"m7 21 5-5 5 5"}]];X(t,K({name:"presentation"},()=>a,{get iconNode(){return r},children:(i,o)=>{var s=z(),n=I(s);B(n,e,"default",{}),O(i,s)},$$slots:{default:!0}}))}function se(t){return t.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim().replace(/^-|-$/g,"")}function ht(){const t=Je({isOpen:!1,activeGame:null,mode:"view",formData:{},validationErrors:{},isSubmitting:!1});return{subscribe:t.subscribe,getState(){return T(t)},openViewModal(e){t.set({isOpen:!0,activeGame:e,mode:"view",formData:{},validationErrors:{},isSubmitting:!1})},openEditModal(e){t.set({isOpen:!0,activeGame:e,mode:"edit",formData:{...e},validationErrors:{},isSubmitting:!1})},openAddModal(){t.set({isOpen:!0,activeGame:null,mode:"add",formData:{status:"Planned",coOp:"No"},validationErrors:{},isSubmitting:!1})},closeModal(){t.set({isOpen:!1,activeGame:null,mode:"view",formData:{},validationErrors:{},isSubmitting:!1})},toggleModal(){t.update(e=>({...e,isOpen:!e.isOpen}))},setActiveGame(e){t.update(a=>({...a,activeGame:e}))},setMode(e){t.update(a=>({...a,mode:e}))},updateFormData(e,a){t.update(r=>({...r,formData:{...r.formData,[e]:a},validationErrors:{...r.validationErrors,[e]:""}}))},resetForm(){t.update(e=>e.mode==="edit"&&e.activeGame?{...e,formData:{...e.activeGame},validationErrors:{},isSubmitting:!1}:{...e,formData:{status:"Planned",coOp:"No"},validationErrors:{},isSubmitting:!1})},validateForm(){const e=T(t),a={};return e.formData.title?.trim()||(a.title="Title is required"),e.formData.platform?.trim()||(a.platform="Platform is required"),e.formData.genre?.trim()||(a.genre="Genre is required"),e.formData.timeToBeat?.trim()||(a.timeToBeat="Time to beat is required"),e.formData.year!==void 0?(e.formData.year<1970||e.formData.year>2099)&&(a.year="Year must be between 1970 and 2099"):a.year="Year is required",e.formData.status==="Completed"&&(e.formData.hoursPlayed?.trim()||(a.hoursPlayed="Hours played is required for completed games"),e.formData.finishedDate||(a.finishedDate="Finished date is required for completed games"),(e.formData.ratingPresentation===null||e.formData.ratingPresentation===void 0)&&(a.ratingPresentation="Presentation rating is required for completed games"),(e.formData.ratingStory===null||e.formData.ratingStory===void 0)&&(a.ratingStory="Story rating is required for completed games"),(e.formData.ratingGameplay===null||e.formData.ratingGameplay===void 0)&&(a.ratingGameplay="Gameplay rating is required for completed games"),e.formData.ratingPresentation!==null&&e.formData.ratingPresentation!==void 0&&(e.formData.ratingPresentation<0||e.formData.ratingPresentation>10)&&(a.ratingPresentation="Presentation rating must be between 0 and 10"),e.formData.ratingStory!==null&&e.formData.ratingStory!==void 0&&(e.formData.ratingStory<0||e.formData.ratingStory>10)&&(a.ratingStory="Story rating must be between 0 and 10"),e.formData.ratingGameplay!==null&&e.formData.ratingGameplay!==void 0&&(e.formData.ratingGameplay<0||e.formData.ratingGameplay>10)&&(a.ratingGameplay="Gameplay rating must be between 0 and 10")),t.update(r=>({...r,validationErrors:a})),Object.keys(a).length===0},async submitForm(){const e=T(t);if(t.update(a=>({...a,isSubmitting:!0,validationErrors:{}})),!this.validateForm())return t.update(a=>({...a,isSubmitting:!1})),!1;try{if(e.mode==="add"){const a=e.formData.ratingPresentation??null,r=e.formData.ratingStory??null,i=e.formData.ratingGameplay??null,o=a!==null&&r!==null&&i!==null?Math.round((a+r+i)/3*2):null,s={...e.formData,id:crypto.randomUUID(),coverImage:`covers/${e.formData.title?.toLowerCase().replace(/[^a-z0-9]/g,"-")||"game"}.webp`,score:o,tier:e.formData.status==="Completed"&&o!==null?this.getTierFromScore(o):null};Q.addGame(s)}else if(e.mode==="edit"&&e.activeGame){const a=e.formData.ratingPresentation??null,r=e.formData.ratingStory??null,i=e.formData.ratingGameplay??null,o=a!==null&&r!==null&&i!==null?Math.round((a+r+i)/3*2):e.activeGame.score,s={...e.activeGame,...e.formData,score:o,tier:e.formData.status==="Completed"&&o!==null?this.getTierFromScore(o):e.formData.status==="Planned"?null:e.activeGame.tier};Q.updateGame(e.activeGame.id,s)}return this.closeModal(),!0}catch(a){return console.error("Error submitting form:",a),t.update(r=>({...r,isSubmitting:!1,validationErrors:{submit:"An error occurred while saving the game. Please try again."}})),!1}},getTierFromScore(e){return e>=18?"S":e>=15?"A":e>=12?"B":e>=9?"C":e>=6?"D":"E"},readFromURL(e,a){const r=e.get("game");if(r){let i=a.find(o=>se(o.title)===r);i||(i=a.find(o=>o.id===r)),i&&t.set({isOpen:!0,activeGame:i,mode:"view",formData:{},validationErrors:{},isSubmitting:!1})}},writeToURL(){if(!(typeof window>"u"))try{const e=T(t),a=new URL(window.location.href);if(e.isOpen&&e.activeGame){const r=se(e.activeGame.title);a.searchParams.set("game",r)}else a.searchParams.delete("game");Qe(a.toString(),{})}catch(e){(!(e instanceof Error)||!e.message.includes("router is initialized"))&&console.warn("Failed to update URL:",e)}},handleEscape(){t.update(e=>e.isOpen?{...e,isOpen:!1}:e)}}}const Mt=ht();export{N as C,$t as G,X as I,Ot as N,Ct as P,Et as T,B as a,R as b,ft as c,At as d,Gt as e,ie as f,Nt as g,Pt as h,Mt as m,ct as r,lt as s};
