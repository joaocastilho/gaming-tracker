const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./wFb2xiu-.js","./DsnmJJEf.js","./DTj0cNIF.js","./B2Cll8NP.js","./v2ug1OsU.js","./C5VE4AoD.js","./DVqzFcWJ.js","./Bg_8vgeG.js","./mKqBO0KA.js","./CEQleZ8F.js","../assets/DetailModal.CKBfrZQW.css"])))=>i.map(i=>d[i]);
import{g as we,e as Re}from"./DVqzFcWJ.js";import{c as Oe,_ as Fe}from"./Fv4RWWOm.js";import"./DsnmJJEf.js";import{C as ue,p as ve,D as W,F as ce,G as I,n as S,f as O,t as re,b as h,c as me,d as l,s as p,g as s,j as a,ag as fe,h as de,i as ie,a as se,ah as Ve,I as Be,b6 as Ie,$ as Ue,W as He}from"./DTj0cNIF.js";import{a as Ce,b as je,i as U,l as ge,s as be,p as xe}from"./B2Cll8NP.js";import{b as J,c as ke,d as Qe,e as qe,T as We,I as he,a as pe,f as De,g as Ke,C as Ne,r as Ee,s as ye,h as Ge,P as Xe,N as Je,G as Ye,m as Ae}from"./v2ug1OsU.js";import{p as _e}from"./BfL4U_Lu.js";import{a as ne,f as w}from"./CEQleZ8F.js";import{b as Le}from"./mKqBO0KA.js";import"./C5VE4AoD.js";async function Ze(n){return we.loadGames(n),{}}const la=Object.freeze(Object.defineProperty({__proto__:null,load:Ze},Symbol.toStringTag,{value:"Module"}));function $e(){ne.toggleTheme()}var et=O('<button type="button" class="theme-toggle svelte-1cmi4dh"><div class="icon-container svelte-1cmi4dh"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></div></button>');function tt(n,e){ve(e,!0);let t=W(ce(typeof document<"u"&&document.documentElement.classList.contains("light")?"light":"dark"));I(()=>ne.theme.subscribe(z=>{S(t,z,!0)}));var r=et();r.__click=[$e];var o=l(r),u=l(o);let d;var f=p(u,2);let k;s(o),s(r),re((G,z)=>{J(r,"aria-label",a(t)==="dark"?"Switch to light mode":"Switch to dark mode"),J(r,"title",a(t)==="dark"?"Switch to light mode":"Switch to dark mode"),d=ke(u,0,"sun-icon svelte-1cmi4dh",null,d,G),k=ke(f,0,"moon-icon svelte-1cmi4dh",null,k,z)},[()=>({visible:a(t)==="light",hidden:a(t)==="dark"}),()=>({visible:a(t)==="dark",hidden:a(t)==="light"})]),h(n,r),me()}ue(["click"]);var at=(n,e,t)=>e(a(t)),rt=O('<span class="tab-count svelte-1elxaub"> </span>'),nt=O('<li class="tab-item svelte-1elxaub" role="presentation"><button type="button" role="tab"><span class="tab-label svelte-1elxaub"> </span> <!></button></li>'),it=O('<header class="header svelte-1elxaub"><div class="header-background svelte-1elxaub"></div> <div class="header-content container mx-auto px-6 svelte-1elxaub"><div class="header-left svelte-1elxaub"><button class="logo svelte-1elxaub" aria-label="Go to homepage and reset all filters"><picture class="logo-image svelte-1elxaub"><source srcset="logo.webp" type="image/webp"/> <img src="logo.png" alt="Gaming Tracker Logo"/></picture></button></div> <div class="header-right"><!></div></div> <nav class="navigation-tabs svelte-1elxaub" aria-label="Game navigation"><div class="navigation-background svelte-1elxaub"></div> <div class="navigation-content svelte-1elxaub"><ul class="tabs-list svelte-1elxaub" role="tablist"></ul></div></nav></header>');function st(n,e){ve(e,!0);const t=()=>Ce(d,"$activeTab",o),r=()=>Ce(f,"$filteredGamesStore",o),[o,u]=je();I(()=>ne.theme.subscribe(()=>{}));const{activeTab:d}=ne,f=w.createFilteredGamesStore(we);if(typeof window<"u"){const v=localStorage.getItem("gaming-tracker-active-tab"),b=window.location.hash.replace("#","");let L=v||"all";b==="completed"?L="completed":b==="planned"?L="planned":b==="tierlist"&&(L="tierlist"),L!==t()&&d.set(L)}const k=fe(()=>[{id:"all",label:"Games",route:"/",count:r().totalCount},{id:"completed",label:"Completed",route:"completed",count:r().completedCount},{id:"planned",label:"Planned",route:"planned",count:r().plannedCount},{id:"tierlist",label:"Tier List",route:"tierlist",count:null}]);function G(){w.resetAllFilters(),d.set("all"),typeof window<"u"&&window.location&&window.history.replaceState(null,"",window.location.pathname+window.location.search),typeof window<"u"&&window.scrollTo({top:0,behavior:"smooth"})}function z(v){if(v.id!==t()&&(d.set(v.id),typeof window<"u")){const b=v.id==="all"?"":`#${v.id}`;window.history.replaceState(null,"",`${window.location.pathname}${b}`)}}var N=it(),j=p(l(N),2),C=l(j),R=l(C);R.__click=G,s(C);var F=p(C,2),Y=l(F);tt(Y,{}),s(F),s(j);var Z=p(j,2),H=p(l(Z),2),$=l(H);Re($,21,()=>a(k),v=>v.id,(v,b)=>{var L=nt(),P=l(L);let i;P.__click=[at,z,b];var y=l(P),x=l(y,!0);s(y);var V=p(y,2);{var c=m=>{var A=rt(),E=l(A);s(A),re(()=>de(E,`(${a(b).count??""})`)),h(m,A)};U(V,m=>{a(b).count!==null&&m(c)})}s(P),s(L),re(m=>{i=ke(P,1,"tab-button svelte-1elxaub",null,i,m),J(P,"aria-selected",t()===a(b).id),J(P,"tabindex",t()===a(b).id?0:-1),de(x,a(b).label)},[()=>({active:t()===a(b).id})]),h(v,L)}),s($),s(H),s(Z),s(N),h(n,N),me(),u()}ue(["click"]);var lt=O('<button type="button" class="clear-button svelte-yyldap" aria-label="Clear search"><span aria-hidden="true">×</span></button>'),ot=O('<div class="search-bar-container svelte-yyldap"><div class="search-bar svelte-yyldap"><span class="search-icon svelte-yyldap" aria-hidden="true">🔍</span> <input type="text" placeholder="Search games..." class="search-input svelte-yyldap" aria-label="Search games" autocomplete="off" spellcheck="false"/> <!></div></div>');function ct(n,e){ve(e,!0);let t,r,o=W("");I(()=>w.searchQuery.subscribe(F=>{S(o,F,!0)})),I(()=>{t&&t.focus()});function u(R){const Y=R.target.value;r&&clearTimeout(r),r=setTimeout(()=>{w.searchQuery.set(Y),w.writeToURL()},300)}function d(){t&&(t.value="",t.focus()),w.searchQuery.set(""),w.writeToURL(),r&&clearTimeout(r)}function f(R){R.key==="Escape"&&t&&t.select()}function k(R){R.key==="Escape"&&t&&(R.preventDefault(),t.focus(),t.select())}I(()=>(document.addEventListener("keydown",k),()=>{document.removeEventListener("keydown",k)}));var G=ot(),z=l(G),N=p(l(z),2);N.__input=u,N.__keydown=f,Le(N,R=>t=R,()=>t);var j=p(N,2);{var C=R=>{var F=lt();F.__click=d,h(R,F)};U(j,R=>{a(o)&&R(C)})}s(z),s(G),h(n,G),me()}ue(["input","keydown","click"]);const dt=n=>Qe[n]||"bg-[#6b7280] text-[#f9fafb]",ut=n=>qe[n]||"bg-[#6b7280] text-[#f9fafb]",vt=n=>We[n]||"bg-gray-600 text-white",mt=n=>{const e=new Set;return n.forEach(t=>{t.platform&&e.add(t.platform)}),Array.from(e).sort()},ft=n=>{const e=new Set;return n.forEach(t=>{t.genre&&e.add(t.genre)}),Array.from(e).sort()},gt=n=>{const e=new Set;n.forEach(o=>{o.status==="Completed"&&o.tier&&e.add(o.tier)});const t={S:"S - Masterpiece",A:"A - Amazing",B:"B - Great",C:"C - Good",D:"D - Decent",E:"E - Bad"};return Array.from(e).map(o=>t[o]).filter(Boolean).sort((o,u)=>{const d=["S - Masterpiece","A - Amazing","B - Great","C - Good","D - Decent","E - Bad"];return d.indexOf(o)-d.indexOf(u)})},bt=n=>({platforms:mt(n),genres:ft(n),tiers:gt(n)});function ht(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2"}],["path",{d:"M3 9h18"}],["path",{d:"M3 15h18"}],["path",{d:"M9 3v18"}],["path",{d:"M15 3v18"}]];he(n,be({name:"grid-3x3"},()=>t,{get iconNode(){return r},children:(o,u)=>{var d=ie(),f=se(d);pe(f,e,"default",{}),h(o,d)},$$slots:{default:!0}}))}function pt(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M3 5h.01"}],["path",{d:"M3 12h.01"}],["path",{d:"M3 19h.01"}],["path",{d:"M8 5h13"}],["path",{d:"M8 12h13"}],["path",{d:"M8 19h13"}]];he(n,be({name:"list"},()=>t,{get iconNode(){return r},children:(o,u)=>{var d=ie(),f=se(d);pe(f,e,"default",{}),h(o,d)},$$slots:{default:!0}}))}function yt(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];he(n,be({name:"monitor"},()=>t,{get iconNode(){return r},children:(o,u)=>{var d=ie(),f=se(d);pe(f,e,"default",{}),h(o,d)},$$slots:{default:!0}}))}function _t(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]];he(n,be({name:"star"},()=>t,{get iconNode(){return r},children:(o,u)=>{var d=ie(),f=se(d);pe(f,e,"default",{}),h(o,d)},$$slots:{default:!0}}))}function xt(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor"}]];he(n,be({name:"tag"},()=>t,{get iconNode(){return r},children:(o,u)=>{var d=ie(),f=se(d);pe(f,e,"default",{}),h(o,d)},$$slots:{default:!0}}))}function wt(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18"}],["path",{d:"M4 22h16"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6"}]];he(n,be({name:"trophy"},()=>t,{get iconNode(){return r},children:(o,u)=>{var d=ie(),f=se(d);pe(f,e,"default",{}),h(o,d)},$$slots:{default:!0}}))}var kt=O('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1uy8f65"> </span>'),Lt=(n,e,t)=>e(t),Mt=O('<button type="button"> </button>'),Tt=(n,e)=>{n.stopPropagation(),e()},St=O('<div class="filter-actions mt-3 flex justify-center svelte-1uy8f65"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),Pt=O('<div class="empty-state py-2 text-center svelte-1uy8f65"><span class="text-muted-foreground text-sm"> </span></div>'),Ct=O('<div class="filter-options-dropdown svelte-1uy8f65"><div class="filter-options-section svelte-1uy8f65"><div class="filter-options-grid svelte-1uy8f65"></div> <!> <!></div></div>'),Rt=O('<div class="filter-dropdown svelte-1uy8f65"><button><!> <span class="filter-label svelte-1uy8f65"> </span> <!></button> <!></div>');function Pe(n,e){ve(e,!0);let t=xe(e,"selectedOptions",19,()=>[]),r=W(!1),o;function u(i){const y=i.target,x=document.querySelector(".filter-options-dropdown");x&&x.contains(y)||o&&!o.contains(y)&&S(r,!1)}I(()=>{if(a(r))return document.addEventListener("click",u),()=>{document.removeEventListener("click",u)}});function d(i){e.type==="platforms"?w.togglePlatform(i):e.type==="genres"?w.toggleGenre(i):e.type==="tiers"&&w.toggleTier(i)}function f(){t().forEach(i=>{e.type==="platforms"?w.removePlatform(i):e.type==="genres"?w.removeGenre(i):e.type==="tiers"&&w.removeTier(i)})}function k(i){return e.type==="platforms"?dt(i):e.type==="genres"?ut(i):e.type==="tiers"?vt(i):"bg-gray-600 text-white"}function G(){return t().length===0?"bg-surface hover:bg-accent hover:text-accent-foreground border-0":"bg-accent text-accent-foreground border-0"}function z(i){i.key==="Escape"?(S(r,!1),i.preventDefault()):(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),S(r,!a(r)))}function N(){return{"aria-expanded":a(r),"aria-haspopup":"listbox","aria-label":`Filter by ${e.label.toLowerCase()}`}}var j=Rt(),C=l(j),R=()=>S(r,!a(r));De(C,(i,y,x)=>({type:"button",class:`filter-button ${i??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:R,onkeydown:z,...y,[Ne]:x}),[G,N,()=>({selected:t().length>0})],void 0,"svelte-1uy8f65");var F=l(C);{var Y=i=>{yt(i,{size:16,class:"text-gray-600 dark:text-gray-400"})},Z=i=>{var y=ie(),x=se(y);{var V=m=>{xt(m,{size:16,class:"text-gray-600 dark:text-gray-400"})},c=m=>{var A=ie(),E=se(A);{var M=_=>{wt(_,{size:16,class:"text-gray-600 dark:text-gray-400"})};U(E,_=>{e.type==="tiers"&&_(M)},!0)}h(m,A)};U(x,m=>{e.type==="genres"?m(V):m(c,!1)},!0)}h(i,y)};U(F,i=>{e.type==="platforms"?i(Y):i(Z,!1)})}var H=p(F,2),$=l(H);s(H);var v=p(H,2);{var b=i=>{var y=kt(),x=l(y,!0);s(y),re(()=>de(x,t().length)),h(i,y)};U(v,i=>{t().length>0&&i(b)})}s(C);var L=p(C,2);{var P=i=>{var y=Ct(),x=l(y),V=l(x);Re(V,20,()=>e.options,M=>M,(M,_)=>{var D=Mt();D.__click=[Lt,d,_];var Q=l(D,!0);s(D),re((q,ee,K)=>{ke(D,1,`filter-option-item ${q??""} ${ee??""}`,"svelte-1uy8f65"),de(Q,K)},[()=>k(_),()=>t().includes(_)?"selected":"",()=>e.type==="tiers"?Ke(_):_]),h(M,D)}),s(V);var c=p(V,2);{var m=M=>{var _=St(),D=l(_);D.__click=[Tt,f],s(_),h(M,_)};U(c,M=>{t().length>0&&M(m)})}var A=p(c,2);{var E=M=>{var _=Pt(),D=l(_),Q=l(D);s(D),s(_),re(q=>de(Q,`No ${q??""} available`),[()=>e.label.toLowerCase()]),h(M,_)};U(A,M=>{e.options.length===0&&M(E)})}s(x),s(y),h(i,y)};U(L,i=>{a(r)&&i(P)})}s(j),Le(j,i=>o=i,()=>o),re(()=>de($,`Filter by ${e.label??""}`)),h(n,j),me()}ue(["click"]);function Et(n,e,t){const r=n.target,o=parseInt(r.value);e(o,a(t),!0)}function Gt(n,e,t){const r=n.target,o=parseInt(r.value);e(a(t),o,!1)}var At=O('<span class="filter-icon svelte-1ugjrx4" aria-label="Rating filter">🏆</span>'),Ot=(n,e)=>{n.stopPropagation(),e()},jt=O('<button type="button" class="reset-button svelte-1ugjrx4" title="Reset to default range">Reset</button>'),Dt=(n,e)=>e(n,"min"),Nt=(n,e)=>e(n,"max"),zt=O('<div class="rating-slider svelte-1ugjrx4"><div class="slider-header svelte-1ugjrx4"><span class="slider-label svelte-1ugjrx4"><!> </span> <!></div> <div class="slider-container svelte-1ugjrx4"><div class="dual-slider-row svelte-1ugjrx4"><div class="slider-track svelte-1ugjrx4" role="application" aria-label="Rating range slider track"><div class="slider-fill svelte-1ugjrx4"><div class="drag-handle drag-handle-left svelte-1ugjrx4" role="button" tabindex="0"></div> <div class="drag-handle drag-handle-right svelte-1ugjrx4" role="button" tabindex="0"></div></div> <input type="range" class="slider-thumb slider-thumb-min svelte-1ugjrx4"/> <input type="range" class="slider-thumb slider-thumb-max svelte-1ugjrx4"/></div></div></div></div>');function Ft(n,e){ve(e,!0);let t=xe(e,"step",3,1),r=xe(e,"disabled",3,!1),o=xe(e,"onRangeChange",3,()=>{});function u(){const g=e.label.toLowerCase();return g.includes("presentation")?Xe:g.includes("story")?Je:g.includes("gameplay")?Ye:null}function d(){const g=e.label.toLowerCase();return g.includes("presentation")?"text-cyan-500":g.includes("story")?"text-amber-600":g.includes("gameplay")?"text-pink-500":"text-gray-600"}let f=W(ce(e.minValue)),k=W(ce(e.maxValue)),G,z=W(!1),N=W(null);I(()=>{S(f,e.minValue,!0),S(k,e.maxValue,!0)});function j(g,T,ae){return Math.min(Math.max(g,T),ae)}function C(g,T,ae=!1){if(r())return;let X=j(g,e.minLimit,e.maxLimit),B=j(T,e.minLimit,e.maxLimit);ae?X=Math.min(X,B):B=Math.max(B,X),X=Math.round(X/t())*t(),B=Math.round(B/t())*t(),S(f,X,!0),S(k,B,!0),o()(X,B)}function R(){C(e.minLimit,e.maxLimit)}function F(g,T){r()||(S(N,T,!0),S(z,!0),document.addEventListener("mousemove",Z),document.addEventListener("mouseup",H),g.preventDefault())}function Y(g){if(r()||!G)return;const T=G.getBoundingClientRect(),ae=g.clientX-T.left,X=T.width,B=ae/X,oe=$()/100,le=v()/100,Me=oe,Te=le;if(B>=Me&&B<=Te){const Se=Math.abs(B-oe),ze=Math.abs(B-le);S(N,Se<=ze?"min":"max",!0),S(z,!0),document.addEventListener("mousemove",Z),document.addEventListener("mouseup",H),g.preventDefault()}}function Z(g){if(!a(z)||!G||r())return;const T=G.getBoundingClientRect(),ae=g.clientX-T.left,X=T.width,B=Math.max(0,Math.min(1,ae/X)),oe=Math.round((B*(e.maxLimit-e.minLimit)+e.minLimit)/t())*t(),le=j(oe,e.minLimit,e.maxLimit);a(N)==="min"?C(le,a(k),!0):a(N)==="max"&&C(a(f),le,!1)}function H(){S(z,!1),S(N,null),document.removeEventListener("mousemove",Z),document.removeEventListener("mouseup",H)}function $(){return(a(f)-e.minLimit)/(e.maxLimit-e.minLimit)*100}function v(){return(a(k)-e.minLimit)/(e.maxLimit-e.minLimit)*100}function b(){return a(f)===e.minLimit&&a(k)===e.maxLimit}function L(){return"#6b7280"}var P=zt(),i=l(P),y=l(i),x=l(y);{var V=g=>{const T=fe(u);var ae=ie(),X=se(ae);{let B=fe(d);Oe(X,()=>a(T),(oe,le)=>{le(oe,{get class(){return`filter-icon ${a(B)??""}`},get"aria-label"(){return`${e.label??""} filter`},size:20})})}h(g,ae)},c=g=>{var T=At();h(g,T)};U(x,g=>{u()?g(V):g(c,!1)})}var m=p(x);s(y);var A=p(y,2);{var E=g=>{var T=jt();T.__click=[Ot,R],re(()=>T.disabled=r()),h(g,T)};U(A,g=>{b()||g(E)})}s(i);var M=p(i,2),_=l(M),D=l(_);D.__mousedown=Y;var Q=l(D),q=l(Q);q.__mousedown=[Dt,F];var ee=p(q,2);ee.__mousedown=[Nt,F],s(Q);var K=p(Q,2);Ee(K),K.__input=[Et,C,k];var te=p(K,2);Ee(te),te.__input=[Gt,C,f],s(D),s(_),s(M),Le(M,g=>G=g,()=>G),s(P),re((g,T,ae,X,B,oe,le,Me,Te,Se)=>{ye(P,`--min-color: ${g??""}; --max-color: ${T??""}`),de(m,` ${e.label??""}
			${a(f)??""} - ${a(k)??""}`),ye(Q,`left: ${ae??""}%; width: ${X??""}%`),ye(q,`background-color: ${B??""}`),J(q,"aria-label",`Drag to adjust minimum ${oe??""} value`),ye(ee,`background-color: ${le??""}`),J(ee,"aria-label",`Drag to adjust maximum ${Me??""} value`),J(K,"min",e.minLimit),J(K,"max",e.maxLimit),J(K,"step",t()),Ge(K,a(f)),K.disabled=r(),J(K,"aria-label",`Minimum ${Te??""} rating`),J(te,"min",e.minLimit),J(te,"max",e.maxLimit),J(te,"step",t()),Ge(te,a(k)),te.disabled=r(),J(te,"aria-label",`Maximum ${Se??""} rating`)},[L,L,$,()=>v()-$(),L,()=>e.label.toLowerCase(),L,()=>e.label.toLowerCase(),()=>e.label.toLowerCase(),()=>e.label.toLowerCase()]),h(n,P),me()}ue(["click","mousedown","input"]);var Vt=O('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1vf89kc"> </span>'),Bt=O('<div class="rating-slider-item svelte-1vf89kc"><!></div>'),It=(n,e)=>{n.stopPropagation(),e()},Ut=O('<div class="filter-actions mt-4 flex justify-center svelte-1vf89kc"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),Ht=O('<div class="ratings-filter-dropdown svelte-1vf89kc"><div class="filter-options-section svelte-1vf89kc"><div class="filter-options-grid svelte-1vf89kc"></div> <!></div></div>'),Qt=O('<div class="ratings-filter svelte-1vf89kc"><button><!> <span class="filter-label svelte-1vf89kc">Filter by Ratings</span> <!></button> <!></div>');function qt(n,e){ve(e,!0);const t={presentation:{label:"Presentation",maxValue:10},story:{label:"Story",maxValue:10},gameplay:{label:"Gameplay",maxValue:10},total:{label:"Score",maxValue:20}};let r=W(!1),o,u=W(ce({presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}));I(()=>w.ratingRanges.subscribe(b=>{S(u,b,!0)}));function d(v){const b=v.target,L=document.querySelector(".ratings-filter-dropdown");L&&L.contains(b)||o&&!o.contains(b)&&S(r,!1)}I(()=>{if(a(r))return document.addEventListener("click",d),()=>{document.removeEventListener("click",d)}});function f(){w.setRatingRange("presentation",0,10),w.setRatingRange("story",0,10),w.setRatingRange("gameplay",0,10),w.setRatingRange("total",0,20)}function k(){return a(u).presentation[0]>0||a(u).presentation[1]<10||a(u).story[0]>0||a(u).story[1]<10||a(u).gameplay[0]>0||a(u).gameplay[1]<10||a(u).total[0]>0||a(u).total[1]<20}function G(){return k()?"bg-accent text-accent-foreground border-0":"bg-surface hover:bg-accent hover:text-accent-foreground border-0"}function z(v){v.key==="Escape"?(S(r,!1),v.preventDefault()):(v.key==="Enter"||v.key===" ")&&(v.preventDefault(),S(r,!a(r)))}function N(){return{"aria-expanded":a(r),"aria-haspopup":"listbox","aria-label":"Filter by ratings"}}var j=Qt(),C=l(j),R=()=>S(r,!a(r));De(C,(v,b,L)=>({type:"button",class:`filter-button ${v??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:R,onkeydown:z,...b,[Ne]:L}),[G,N,()=>({selected:k()})],void 0,"svelte-1vf89kc");var F=l(C);_t(F,{size:16,class:"text-gray-600 dark:text-gray-400"});var Y=p(F,4);{var Z=v=>{var b=Vt(),L=l(b,!0);s(b),re(P=>de(L,P),[()=>[a(u).presentation,a(u).story,a(u).gameplay,a(u).total].filter(([P,i],y)=>{const x=[[0,10],[0,10],[0,10],[0,20]];return P>x[y][0]||i<x[y][1]}).length]),h(v,b)};U(Y,v=>{k()&&v(Z)})}s(C);var H=p(C,2);{var $=v=>{var b=Ht(),L=l(b),P=l(L);Re(P,21,()=>Object.entries(t),([x,V])=>x,(x,V)=>{var c=fe(()=>Ve(a(V),2));let m=()=>a(c)[0],A=()=>a(c)[1];const E=fe(m),M=fe(()=>a(u)[a(E)]);var _=Bt(),D=l(_);Ft(D,{get label(){return A().label},get minValue(){return a(M)[0]},get maxValue(){return a(M)[1]},step:1,minLimit:0,get maxLimit(){return A().maxValue},onRangeChange:(Q,q)=>w.setRatingRange(a(E),Q,q)}),s(_),h(x,_)}),s(P);var i=p(P,2);{var y=x=>{var V=Ut(),c=l(V);c.__click=[It,f],s(V),h(x,V)};U(i,x=>{k()&&x(y)})}s(L),s(b),h(v,b)};U(H,v=>{a(r)&&v($)})}s(j),Le(j,v=>o=v,()=>o),h(n,j),me()}ue(["click"]);function Wt(){ne.toggleViewMode()}var Kt=O('<meta name="viewport" content="width=device-width, initial-scale=1.0"/>'),Xt=O('<div class="flex flex-col items-center gap-4"><div class="flex flex-wrap items-center justify-center gap-3"><!> <!> <!> <!> <button class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors svelte-12qhfyh" title="Reset all filters">↻ Reset</button> <div class="view-toggle-container"><button class="view-toggle-button flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"><!></button></div></div></div>'),Jt=O('<div class="bg-background text-foreground min-h-screen"><!> <section class="filter-section sticky top-[104px] z-30 md:top-[110px] svelte-12qhfyh"><div class="container mx-auto space-y-4 px-6 py-4"><!> <!></div></section> <main style="background-color: var(--color-background);" class="px-6 pt-0 pb-6"><div class="container mx-auto"><!></div></main> <!></div>');function oa(n,e){ve(e,!0);const t=()=>Ce(Ae,"$modalStore",r),[r,o]=je();let u=!1,d,f=W(null),k=W(ce({platforms:[],genres:[],tiers:[]})),G=W("gallery"),z=W("all");I(()=>we.subscribe(m=>{S(k,bt(m),!0)})),I(()=>ne.viewMode.subscribe(m=>{S(G,m,!0)})),I(()=>ne.activeTab.subscribe(m=>{S(z,m,!0)})),I(()=>{if(!u){const c=_e.url.searchParams.get("game");c&&setTimeout(()=>{const m=we.getGameBySlug(c);m&&Ae.openViewModal(m)},100),u=!0}}),I(()=>{t().isOpen&&!a(f)&&Fe(()=>import("./wFb2xiu-.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10]),import.meta.url).then(c=>{S(f,c.default,!0)}).catch(c=>{console.error("Failed to load DetailModal:",c)})});let N={searchQuery:"",selectedPlatforms:[],selectedGenres:[],selectedTiers:[],ratingRanges:{presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}};w.filterState.subscribe(c=>{N=c}),I(()=>{u&&(d&&clearTimeout(d),d=setTimeout(()=>{ne.writeToURLWithFilters(w)},300))}),I(()=>{const c=_e.url,m=c.searchParams.get("search")||"",A=c.searchParams.get("platforms")||"",E=c.searchParams.get("genres")||"",M=c.searchParams.get("tiers")||"",_=c.searchParams.get("ratingPresentation")||"",D=c.searchParams.get("ratingStory")||"",Q=c.searchParams.get("ratingGameplay")||"",q=c.searchParams.get("ratingTotal")||"",ee={searchQuery:m,selectedPlatforms:A?A.split(","):[],selectedGenres:E?E.split(","):[],selectedTiers:M?M.split(","):[],ratingRanges:{presentation:_?_.split(",").map(Number):[0,10],story:D?D.split(",").map(Number):[0,10],gameplay:Q?Q.split(",").map(Number):[0,10],total:q?q.split(",").map(Number):[0,20]}},K=JSON.stringify(ee),te=JSON.stringify(N);u&&K!==te&&w.readFromURL(_e.url.searchParams),w.readFromURL(_e.url.searchParams)});let j=W(ce([])),C=W(ce([])),R=W(ce([]));I(()=>{const c=w.selectedPlatforms.subscribe(E=>{S(j,E,!0)}),m=w.selectedGenres.subscribe(E=>{S(C,E,!0)}),A=w.selectedTiers.subscribe(E=>{S(R,E,!0)});return()=>{c(),m(),A()}});function F(){w.resetAllFilters(),w.searchQuery.set(""),ne.activeTab.set("all"),d&&clearTimeout(d),ne.writeToURLWithFilters(w),setTimeout(()=>{window.scrollTo({top:0,behavior:"smooth"}),requestAnimationFrame(()=>{window.scrollTo(0,0),document.documentElement.scrollTop=0})},200)}var Y=Jt();Be(c=>{var m=Kt();Ue.title="Gaming Tracker",h(c,m)});var Z=l(Y);st(Z,{});var H=p(Z,2),$=l(H),v=l($);ct(v,{});var b=p(v,2);{var L=c=>{var m=Xt(),A=l(m),E=l(A);Pe(E,{type:"platforms",label:"Platforms",get options(){return a(k).platforms},get selectedOptions(){return a(j)}});var M=p(E,2);Pe(M,{type:"genres",label:"Genres",get options(){return a(k).genres},get selectedOptions(){return a(C)}});var _=p(M,2);Pe(_,{type:"tiers",label:"Tiers",get options(){return a(k).tiers},get selectedOptions(){return a(R)}});var D=p(_,2);qt(D,{});var Q=p(D,2);Q.__click=F;var q=p(Q,2),ee=l(q);ee.__click=[Wt];var K=l(ee);{var te=T=>{pt(T,{size:18,class:"text-gray-600 dark:text-gray-400"})},g=T=>{ht(T,{size:18,class:"text-gray-600 dark:text-gray-400"})};U(K,T=>{a(G)==="gallery"?T(te):T(g,!1)})}s(ee),s(q),s(A),s(m),re(()=>J(ee,"title",a(G)==="gallery"?"Switch to table view":"Switch to gallery view")),h(c,m)};U(b,c=>{a(z)!=="tierlist"&&c(L)})}s($),s(H);var P=p(H,2),i=l(P),y=l(i);Ie(y,()=>e.children??He),s(i),s(P);var x=p(P,2);{var V=c=>{var m=ie(),A=se(m);Oe(A,()=>a(f),(E,M)=>{M(E,{})}),h(c,m)};U(x,c=>{a(f)&&c(V)})}s(Y),h(n,Y),me(),o()}ue(["click"]);export{wt as T,la as _,oa as a};
