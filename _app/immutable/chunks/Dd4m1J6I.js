const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./aN6fCjLO.js","./DsnmJJEf.js","./CrUECPgc.js","./BdHjqEeA.js","./CZnIKM9l.js","./QvXVa1Gx.js","./CSdGbOpk.js","./BRCwGT32.js","./CVtoJdcG.js","./CZlLVsl0.js","./Cg38D0CO.js","../assets/GameCard.B135ZzL1.css","./Dlzk0DUJ.js","./B5wZWfu3.js","./BR1bb6iM.js","../assets/TierListView.au9T7giM.css","./D1l30uqp.js","./BErY1OLK.js","./BJZzmL-U.js","../assets/DetailModal.Cpb9Cm9V.css"])))=>i.map(i=>d[i]);
import{g as ke,e as Ee}from"./QvXVa1Gx.js";import{_ as _e,c as De}from"./BQciHioo.js";import"./DsnmJJEf.js";import{C as de,p as ve,D as W,F as ce,G as B,n as S,f as O,t as re,b as p,c as me,d as l,s as y,g as s,j as a,ag as fe,h as ue,ai as Fe,i as ie,a as se,ah as Ie,I as Be,aX as Ue,$ as He,W as Qe}from"./BdHjqEeA.js";import{a as Ce,b as je,i as U,l as ge,s as be,p as we}from"./CZnIKM9l.js";import{c as J,d as Le,e as qe,f as We,T as Xe,I as pe,b as he,h as Ve,g as Ke,C as Ne,r as Ae,s as ye,i as Ge,P as Je,N as Ye,G as Ze,m as Oe}from"./CVtoJdcG.js";import{p as xe}from"./B2fkiTZI.js";import{a as ne,f as L}from"./BJZzmL-U.js";import{b as Me}from"./BErY1OLK.js";import"./CrUECPgc.js";async function $e(n){return ke.loadGames(n),{}}const ca=Object.freeze(Object.defineProperty({__proto__:null,load:$e},Symbol.toStringTag,{value:"Module"}));function et(){ne.toggleTheme()}var tt=O('<button type="button" class="theme-toggle svelte-1cmi4dh"><div class="icon-container svelte-1cmi4dh"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></div></button>');function at(n,e){ve(e,!0);let t=W(ce(typeof document<"u"&&document.documentElement.classList.contains("light")?"light":"dark"));B(()=>ne.theme.subscribe(V=>{S(t,V,!0)}));var r=tt();r.__click=[et];var o=l(r),d=l(o);let u;var f=y(d,2);let M;s(o),s(r),re((G,V)=>{J(r,"aria-label",a(t)==="dark"?"Switch to light mode":"Switch to dark mode"),J(r,"title",a(t)==="dark"?"Switch to light mode":"Switch to dark mode"),u=Le(d,0,"sun-icon svelte-1cmi4dh",null,u,G),M=Le(f,0,"moon-icon svelte-1cmi4dh",null,M,V)},[()=>({visible:a(t)==="light",hidden:a(t)==="dark"}),()=>({visible:a(t)==="dark",hidden:a(t)==="light"})]),p(n,r),me()}de(["click"]);var rt=(n,e,t)=>e(a(t)),nt=(n,e,t)=>e(a(t).id),it=O('<span class="tab-count svelte-1elxaub"> </span>'),st=O('<li class="tab-item svelte-1elxaub" role="presentation"><button type="button" role="tab"><span class="tab-label svelte-1elxaub"> </span> <!></button></li>'),lt=O('<header class="header svelte-1elxaub"><div class="header-background svelte-1elxaub"></div> <div class="header-content container mx-auto px-6 svelte-1elxaub"><div class="header-left svelte-1elxaub"><button class="logo svelte-1elxaub" aria-label="Go to homepage and reset all filters"><picture class="logo-image svelte-1elxaub"><source srcset="logo.webp" type="image/webp"/> <img src="logo.png" alt="Gaming Tracker Logo"/></picture></button></div> <div class="header-right"><!></div></div> <nav class="navigation-tabs svelte-1elxaub" aria-label="Game navigation"><div class="navigation-background svelte-1elxaub"></div> <div class="navigation-content svelte-1elxaub"><ul class="tabs-list svelte-1elxaub" role="tablist"></ul></div></nav></header>');function ot(n,e){ve(e,!0);const t=()=>Ce(u,"$activeTab",o),r=()=>Ce(f,"$filteredGamesStore",o),[o,d]=je();B(()=>ne.theme.subscribe(()=>{}));const{activeTab:u}=ne,f=L.createFilteredGamesStore(ke);if(typeof window<"u"){const v=localStorage.getItem("gaming-tracker-active-tab"),b=window.location.hash.replace("#","");let T=v||"all";b==="completed"?T="completed":b==="planned"?T="planned":b==="tierlist"&&(T="tierlist"),T!==t()&&u.set(T)}const M=fe(()=>[{id:"all",label:"Games",route:"/",count:r().totalCount},{id:"completed",label:"Completed",route:"completed",count:r().completedCount},{id:"planned",label:"Planned",route:"planned",count:r().plannedCount},{id:"tierlist",label:"Tier List",route:"tierlist",count:null}]);function G(){L.resetAllFilters(),u.set("all"),typeof window<"u"&&window.location&&window.history.replaceState(null,"",window.location.pathname+window.location.search),typeof window<"u"&&window.scrollTo({top:0,behavior:"smooth"})}function V(v){if(v.id!==t()&&(u.set(v.id),typeof window<"u")){const b=v.id==="all"?"":`#${v.id}`;window.history.replaceState(null,"",`${window.location.pathname}${b}`)}}function N(v){v==="all"?_e(()=>import("./aN6fCjLO.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):v==="completed"?_e(()=>import("./Dlzk0DUJ.js"),__vite__mapDeps([12,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):v==="planned"?_e(()=>import("./B5wZWfu3.js"),__vite__mapDeps([13,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):v==="tierlist"&&_e(()=>import("./BR1bb6iM.js"),__vite__mapDeps([14,1,2,3,5,4,8,9,6,7,10,11,15]),import.meta.url)}var D=lt(),A=y(l(D),2),R=l(A),z=l(R);z.__click=G,s(R);var Y=y(R,2),$=l(Y);at($,{}),s(Y),s(A);var H=y(A,2),Z=y(l(H),2),h=l(Z);Ee(h,21,()=>a(M),v=>v.id,(v,b)=>{var T=st(),i=l(T);let k;i.__click=[rt,V,b],i.__mouseover=[nt,N,b];var _=l(i),F=l(_,!0);s(_);var c=y(_,2);{var m=E=>{var C=it(),x=l(C);s(C),re(()=>ue(x,`(${a(b).count??""})`)),p(E,C)};U(c,E=>{a(b).count!==null&&E(m)})}s(i),s(T),re(E=>{k=Le(i,1,"tab-button svelte-1elxaub",null,k,E),J(i,"aria-selected",t()===a(b).id),J(i,"tabindex",t()===a(b).id?0:-1),ue(F,a(b).label)},[()=>({active:t()===a(b).id})]),Fe("focus",i,()=>N(a(b).id)),p(v,T)}),s(h),s(Z),s(H),s(D),p(n,D),me(),d()}de(["click","mouseover"]);var ct=O('<button type="button" class="clear-button svelte-yyldap" aria-label="Clear search"><span aria-hidden="true">×</span></button>'),ut=O('<div class="search-bar-container svelte-yyldap"><div class="search-bar svelte-yyldap"><span class="search-icon svelte-yyldap" aria-hidden="true">🔍</span> <input type="text" placeholder="Search games..." class="search-input svelte-yyldap" aria-label="Search games" autocomplete="off" spellcheck="false"/> <!></div></div>');function dt(n,e){ve(e,!0);let t,r,o=W("");B(()=>L.searchQuery.subscribe(z=>{S(o,z,!0)})),B(()=>{t&&t.focus()});function d(R){const Y=R.target.value;r&&clearTimeout(r),r=setTimeout(()=>{L.searchQuery.set(Y),L.writeToURL()},300)}function u(){t&&(t.value="",t.focus()),L.searchQuery.set(""),L.writeToURL(),r&&clearTimeout(r)}function f(R){R.key==="Escape"&&t&&t.select()}function M(R){R.key==="Escape"&&t&&(R.preventDefault(),t.focus(),t.select())}B(()=>(document.addEventListener("keydown",M),()=>{document.removeEventListener("keydown",M)}));var G=ut(),V=l(G),N=y(l(V),2);N.__input=d,N.__keydown=f,Me(N,R=>t=R,()=>t);var D=y(N,2);{var A=R=>{var z=ct();z.__click=u,p(R,z)};U(D,R=>{a(o)&&R(A)})}s(V),s(G),p(n,G),me()}de(["input","keydown","click"]);const vt=n=>qe[n]||"bg-[#6b7280] text-[#f9fafb]",mt=n=>We[n]||"bg-[#6b7280] text-[#f9fafb]",ft=n=>Xe[n]||"bg-gray-600 text-white",gt=n=>{const e=new Set;return n.forEach(t=>{t.platform&&e.add(t.platform)}),Array.from(e).sort()},bt=n=>{const e=new Set;return n.forEach(t=>{t.genre&&e.add(t.genre)}),Array.from(e).sort()},pt=n=>{const e=new Set;n.forEach(o=>{o.status==="Completed"&&o.tier&&e.add(o.tier)});const t={S:"S - Masterpiece",A:"A - Amazing",B:"B - Great",C:"C - Good",D:"D - Decent",E:"E - Bad"};return Array.from(e).map(o=>t[o]).filter(Boolean).sort((o,d)=>{const u=["S - Masterpiece","A - Amazing","B - Great","C - Good","D - Decent","E - Bad"];return u.indexOf(o)-u.indexOf(d)})},ht=n=>({platforms:gt(n),genres:bt(n),tiers:pt(n)});function _t(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2"}],["path",{d:"M3 9h18"}],["path",{d:"M3 15h18"}],["path",{d:"M9 3v18"}],["path",{d:"M15 3v18"}]];pe(n,be({name:"grid-3x3"},()=>t,{get iconNode(){return r},children:(o,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(o,u)},$$slots:{default:!0}}))}function yt(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M3 5h.01"}],["path",{d:"M3 12h.01"}],["path",{d:"M3 19h.01"}],["path",{d:"M8 5h13"}],["path",{d:"M8 12h13"}],["path",{d:"M8 19h13"}]];pe(n,be({name:"list"},()=>t,{get iconNode(){return r},children:(o,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(o,u)},$$slots:{default:!0}}))}function xt(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];pe(n,be({name:"monitor"},()=>t,{get iconNode(){return r},children:(o,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(o,u)},$$slots:{default:!0}}))}function wt(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]];pe(n,be({name:"star"},()=>t,{get iconNode(){return r},children:(o,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(o,u)},$$slots:{default:!0}}))}function kt(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor"}]];pe(n,be({name:"tag"},()=>t,{get iconNode(){return r},children:(o,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(o,u)},$$slots:{default:!0}}))}function Lt(n,e){const t=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18"}],["path",{d:"M4 22h16"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6"}]];pe(n,be({name:"trophy"},()=>t,{get iconNode(){return r},children:(o,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(o,u)},$$slots:{default:!0}}))}var Mt=O('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1uy8f65"> </span>'),Tt=(n,e,t)=>e(t),Pt=O('<button type="button"> </button>'),St=(n,e)=>{n.stopPropagation(),e()},Rt=O('<div class="filter-actions mt-3 flex justify-center svelte-1uy8f65"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),Ct=O('<div class="empty-state py-2 text-center svelte-1uy8f65"><span class="text-muted-foreground text-sm"> </span></div>'),Et=O('<div class="filter-options-dropdown svelte-1uy8f65"><div class="filter-options-section svelte-1uy8f65"><div class="filter-options-grid svelte-1uy8f65"></div> <!> <!></div></div>'),At=O('<div class="filter-dropdown svelte-1uy8f65"><button><!> <span class="filter-label svelte-1uy8f65"> </span> <!></button> <!></div>');function Re(n,e){ve(e,!0);let t=we(e,"selectedOptions",19,()=>[]),r=W(!1),o;function d(i){const k=i.target,_=document.querySelector(".filter-options-dropdown");_&&_.contains(k)||o&&!o.contains(k)&&S(r,!1)}B(()=>{if(a(r))return document.addEventListener("click",d),()=>{document.removeEventListener("click",d)}});function u(i){e.type==="platforms"?L.togglePlatform(i):e.type==="genres"?L.toggleGenre(i):e.type==="tiers"&&L.toggleTier(i)}function f(){t().forEach(i=>{e.type==="platforms"?L.removePlatform(i):e.type==="genres"?L.removeGenre(i):e.type==="tiers"&&L.removeTier(i)})}function M(i){return e.type==="platforms"?vt(i):e.type==="genres"?mt(i):e.type==="tiers"?ft(i):"bg-gray-600 text-white"}function G(){return t().length===0?"bg-surface hover:bg-accent hover:text-accent-foreground border-0":"bg-accent text-accent-foreground border-0"}function V(i){i.key==="Escape"?(S(r,!1),i.preventDefault()):(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),S(r,!a(r)))}function N(){return{"aria-expanded":a(r),"aria-haspopup":"listbox","aria-label":`Filter by ${e.label.toLowerCase()}`}}var D=At(),A=l(D),R=()=>S(r,!a(r));Ve(A,(i,k,_)=>({type:"button",class:`filter-button ${i??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:R,onkeydown:V,...k,[Ne]:_}),[G,N,()=>({selected:t().length>0})],void 0,"svelte-1uy8f65");var z=l(A);{var Y=i=>{xt(i,{size:16,class:"text-gray-600 dark:text-gray-400"})},$=i=>{var k=ie(),_=se(k);{var F=m=>{kt(m,{size:16,class:"text-gray-600 dark:text-gray-400"})},c=m=>{var E=ie(),C=se(E);{var x=w=>{Lt(w,{size:16,class:"text-gray-600 dark:text-gray-400"})};U(C,w=>{e.type==="tiers"&&w(x)},!0)}p(m,E)};U(_,m=>{e.type==="genres"?m(F):m(c,!1)},!0)}p(i,k)};U(z,i=>{e.type==="platforms"?i(Y):i($,!1)})}var H=y(z,2),Z=l(H);s(H);var h=y(H,2);{var v=i=>{var k=Mt(),_=l(k,!0);s(k),re(()=>ue(_,t().length)),p(i,k)};U(h,i=>{t().length>0&&i(v)})}s(A);var b=y(A,2);{var T=i=>{var k=Et(),_=l(k),F=l(_);Ee(F,20,()=>e.options,x=>x,(x,w)=>{var j=Pt();j.__click=[Tt,u,w];var Q=l(j,!0);s(j),re((q,ee,X)=>{Le(j,1,`filter-option-item ${q??""} ${ee??""}`,"svelte-1uy8f65"),ue(Q,X)},[()=>M(w),()=>t().includes(w)?"selected":"",()=>e.type==="tiers"?Ke(w):w]),p(x,j)}),s(F);var c=y(F,2);{var m=x=>{var w=Rt(),j=l(w);j.__click=[St,f],s(w),p(x,w)};U(c,x=>{t().length>0&&x(m)})}var E=y(c,2);{var C=x=>{var w=Ct(),j=l(w),Q=l(j);s(j),s(w),re(q=>ue(Q,`No ${q??""} available`),[()=>e.label.toLowerCase()]),p(x,w)};U(E,x=>{e.options.length===0&&x(C)})}s(_),s(k),p(i,k)};U(b,i=>{a(r)&&i(T)})}s(D),Me(D,i=>o=i,()=>o),re(()=>ue(Z,`Filter by ${e.label??""}`)),p(n,D),me()}de(["click"]);function Gt(n,e,t){const r=n.target,o=parseInt(r.value);e(o,a(t),!0)}function Ot(n,e,t){const r=n.target,o=parseInt(r.value);e(a(t),o,!1)}var Dt=O('<span class="filter-icon svelte-1ugjrx4" aria-label="Rating filter">🏆</span>'),jt=(n,e)=>{n.stopPropagation(),e()},Vt=O('<button type="button" class="reset-button svelte-1ugjrx4" title="Reset to default range">Reset</button>'),Nt=(n,e)=>e(n,"min"),zt=(n,e)=>e(n,"max"),Ft=O('<div class="rating-slider svelte-1ugjrx4"><div class="slider-header svelte-1ugjrx4"><span class="slider-label svelte-1ugjrx4"><!> </span> <!></div> <div class="slider-container svelte-1ugjrx4"><div class="dual-slider-row svelte-1ugjrx4"><div class="slider-track svelte-1ugjrx4" role="application" aria-label="Rating range slider track"><div class="slider-fill svelte-1ugjrx4"><div class="drag-handle drag-handle-left svelte-1ugjrx4" role="button" tabindex="0"></div> <div class="drag-handle drag-handle-right svelte-1ugjrx4" role="button" tabindex="0"></div></div> <input type="range" class="slider-thumb slider-thumb-min svelte-1ugjrx4"/> <input type="range" class="slider-thumb slider-thumb-max svelte-1ugjrx4"/></div></div></div></div>');function It(n,e){ve(e,!0);let t=we(e,"step",3,1),r=we(e,"disabled",3,!1),o=we(e,"onRangeChange",3,()=>{});function d(){const g=e.label.toLowerCase();return g.includes("presentation")?Je:g.includes("story")?Ye:g.includes("gameplay")?Ze:null}function u(){const g=e.label.toLowerCase();return g.includes("presentation")?"text-cyan-500":g.includes("story")?"text-amber-600":g.includes("gameplay")?"text-pink-500":"text-gray-600"}let f=W(ce(e.minValue)),M=W(ce(e.maxValue)),G,V=W(!1),N=W(null);B(()=>{S(f,e.minValue,!0),S(M,e.maxValue,!0)});function D(g,P,ae){return Math.min(Math.max(g,P),ae)}function A(g,P,ae=!1){if(r())return;let K=D(g,e.minLimit,e.maxLimit),I=D(P,e.minLimit,e.maxLimit);ae?K=Math.min(K,I):I=Math.max(I,K),K=Math.round(K/t())*t(),I=Math.round(I/t())*t(),S(f,K,!0),S(M,I,!0),o()(K,I)}function R(){A(e.minLimit,e.maxLimit)}function z(g,P){r()||(S(N,P,!0),S(V,!0),document.addEventListener("mousemove",$),document.addEventListener("mouseup",H),g.preventDefault())}function Y(g){if(r()||!G)return;const P=G.getBoundingClientRect(),ae=g.clientX-P.left,K=P.width,I=ae/K,oe=Z()/100,le=h()/100,Te=oe,Pe=le;if(I>=Te&&I<=Pe){const Se=Math.abs(I-oe),ze=Math.abs(I-le);S(N,Se<=ze?"min":"max",!0),S(V,!0),document.addEventListener("mousemove",$),document.addEventListener("mouseup",H),g.preventDefault()}}function $(g){if(!a(V)||!G||r())return;const P=G.getBoundingClientRect(),ae=g.clientX-P.left,K=P.width,I=Math.max(0,Math.min(1,ae/K)),oe=Math.round((I*(e.maxLimit-e.minLimit)+e.minLimit)/t())*t(),le=D(oe,e.minLimit,e.maxLimit);a(N)==="min"?A(le,a(M),!0):a(N)==="max"&&A(a(f),le,!1)}function H(){S(V,!1),S(N,null),document.removeEventListener("mousemove",$),document.removeEventListener("mouseup",H)}function Z(){return(a(f)-e.minLimit)/(e.maxLimit-e.minLimit)*100}function h(){return(a(M)-e.minLimit)/(e.maxLimit-e.minLimit)*100}function v(){return a(f)===e.minLimit&&a(M)===e.maxLimit}function b(){return"#6b7280"}var T=Ft(),i=l(T),k=l(i),_=l(k);{var F=g=>{const P=fe(d);var ae=ie(),K=se(ae);{let I=fe(u);De(K,()=>a(P),(oe,le)=>{le(oe,{get class(){return`filter-icon ${a(I)??""}`},get"aria-label"(){return`${e.label??""} filter`},size:20})})}p(g,ae)},c=g=>{var P=Dt();p(g,P)};U(_,g=>{d()?g(F):g(c,!1)})}var m=y(_);s(k);var E=y(k,2);{var C=g=>{var P=Vt();P.__click=[jt,R],re(()=>P.disabled=r()),p(g,P)};U(E,g=>{v()||g(C)})}s(i);var x=y(i,2),w=l(x),j=l(w);j.__mousedown=Y;var Q=l(j),q=l(Q);q.__mousedown=[Nt,z];var ee=y(q,2);ee.__mousedown=[zt,z],s(Q);var X=y(Q,2);Ae(X),X.__input=[Gt,A,M];var te=y(X,2);Ae(te),te.__input=[Ot,A,f],s(j),s(w),s(x),Me(x,g=>G=g,()=>G),s(T),re((g,P,ae,K,I,oe,le,Te,Pe,Se)=>{ye(T,`--min-color: ${g??""}; --max-color: ${P??""}`),ue(m,` ${e.label??""}
			${a(f)??""} - ${a(M)??""}`),ye(Q,`left: ${ae??""}%; width: ${K??""}%`),ye(q,`background-color: ${I??""}`),J(q,"aria-label",`Drag to adjust minimum ${oe??""} value`),ye(ee,`background-color: ${le??""}`),J(ee,"aria-label",`Drag to adjust maximum ${Te??""} value`),J(X,"min",e.minLimit),J(X,"max",e.maxLimit),J(X,"step",t()),Ge(X,a(f)),X.disabled=r(),J(X,"aria-label",`Minimum ${Pe??""} rating`),J(te,"min",e.minLimit),J(te,"max",e.maxLimit),J(te,"step",t()),Ge(te,a(M)),te.disabled=r(),J(te,"aria-label",`Maximum ${Se??""} rating`)},[b,b,Z,()=>h()-Z(),b,()=>e.label.toLowerCase(),b,()=>e.label.toLowerCase(),()=>e.label.toLowerCase(),()=>e.label.toLowerCase()]),p(n,T),me()}de(["click","mousedown","input"]);var Bt=O('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1vf89kc"> </span>'),Ut=O('<div class="rating-slider-item svelte-1vf89kc"><!></div>'),Ht=(n,e)=>{n.stopPropagation(),e()},Qt=O('<div class="filter-actions mt-4 flex justify-center svelte-1vf89kc"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),qt=O('<div class="ratings-filter-dropdown svelte-1vf89kc"><div class="filter-options-section svelte-1vf89kc"><div class="filter-options-grid svelte-1vf89kc"></div> <!></div></div>'),Wt=O('<div class="ratings-filter svelte-1vf89kc"><button><!> <span class="filter-label svelte-1vf89kc">Filter by Ratings</span> <!></button> <!></div>');function Xt(n,e){ve(e,!0);const t={presentation:{label:"Presentation",maxValue:10},story:{label:"Story",maxValue:10},gameplay:{label:"Gameplay",maxValue:10},total:{label:"Score",maxValue:20}};let r=W(!1),o,d=W(ce({presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}));B(()=>L.ratingRanges.subscribe(v=>{S(d,v,!0)}));function u(h){const v=h.target,b=document.querySelector(".ratings-filter-dropdown");b&&b.contains(v)||o&&!o.contains(v)&&S(r,!1)}B(()=>{if(a(r))return document.addEventListener("click",u),()=>{document.removeEventListener("click",u)}});function f(){L.setRatingRange("presentation",0,10),L.setRatingRange("story",0,10),L.setRatingRange("gameplay",0,10),L.setRatingRange("total",0,20)}function M(){return a(d).presentation[0]>0||a(d).presentation[1]<10||a(d).story[0]>0||a(d).story[1]<10||a(d).gameplay[0]>0||a(d).gameplay[1]<10||a(d).total[0]>0||a(d).total[1]<20}function G(){return M()?"bg-accent text-accent-foreground border-0":"bg-surface hover:bg-accent hover:text-accent-foreground border-0"}function V(h){h.key==="Escape"?(S(r,!1),h.preventDefault()):(h.key==="Enter"||h.key===" ")&&(h.preventDefault(),S(r,!a(r)))}function N(){return{"aria-expanded":a(r),"aria-haspopup":"listbox","aria-label":"Filter by ratings"}}var D=Wt(),A=l(D),R=()=>S(r,!a(r));Ve(A,(h,v,b)=>({type:"button",class:`filter-button ${h??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:R,onkeydown:V,...v,[Ne]:b}),[G,N,()=>({selected:M()})],void 0,"svelte-1vf89kc");var z=l(A);wt(z,{size:16,class:"text-gray-600 dark:text-gray-400"});var Y=y(z,4);{var $=h=>{var v=Bt(),b=l(v,!0);s(v),re(T=>ue(b,T),[()=>[a(d).presentation,a(d).story,a(d).gameplay,a(d).total].filter(([T,i],k)=>{const _=[[0,10],[0,10],[0,10],[0,20]];return T>_[k][0]||i<_[k][1]}).length]),p(h,v)};U(Y,h=>{M()&&h($)})}s(A);var H=y(A,2);{var Z=h=>{var v=qt(),b=l(v),T=l(b);Ee(T,21,()=>Object.entries(t),([_,F])=>_,(_,F)=>{var c=fe(()=>Ie(a(F),2));let m=()=>a(c)[0],E=()=>a(c)[1];const C=fe(m),x=fe(()=>a(d)[a(C)]);var w=Ut(),j=l(w);It(j,{get label(){return E().label},get minValue(){return a(x)[0]},get maxValue(){return a(x)[1]},step:1,minLimit:0,get maxLimit(){return E().maxValue},onRangeChange:(Q,q)=>L.setRatingRange(a(C),Q,q)}),s(w),p(_,w)}),s(T);var i=y(T,2);{var k=_=>{var F=Qt(),c=l(F);c.__click=[Ht,f],s(F),p(_,F)};U(i,_=>{M()&&_(k)})}s(b),s(v),p(h,v)};U(H,h=>{a(r)&&h(Z)})}s(D),Me(D,h=>o=h,()=>o),p(n,D),me()}de(["click"]);function Kt(){ne.toggleViewMode()}var Jt=O('<meta name="viewport" content="width=device-width, initial-scale=1.0"/>'),Yt=O('<div class="flex flex-col items-center gap-4"><div class="flex flex-wrap items-center justify-center gap-3"><!> <!> <!> <!> <button class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors svelte-12qhfyh" title="Reset all filters">↻ Reset</button> <div class="view-toggle-container"><button class="view-toggle-button flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"><!></button></div></div></div>'),Zt=O('<div class="bg-background text-foreground min-h-screen"><!> <section class="filter-section sticky top-[104px] z-30 md:top-[110px] svelte-12qhfyh"><div class="container mx-auto space-y-4 px-6 py-4"><!> <!></div></section> <main style="background-color: var(--color-background);" class="px-6 pt-0 pb-6"><div class="container mx-auto"><!></div></main> <!></div>');function ua(n,e){ve(e,!0);const t=()=>Ce(Oe,"$modalStore",r),[r,o]=je();let d=!1,u,f=W(null),M=W(ce({platforms:[],genres:[],tiers:[]})),G=W("gallery"),V=W("all");B(()=>ke.subscribe(m=>{S(M,ht(m),!0)})),B(()=>ne.viewMode.subscribe(m=>{S(G,m,!0)})),B(()=>ne.activeTab.subscribe(m=>{S(V,m,!0)})),B(()=>{if(!d){const c=xe.url.searchParams.get("game");c&&setTimeout(()=>{const m=ke.getGameBySlug(c);m&&Oe.openViewModal(m)},100),d=!0}}),B(()=>{t().isOpen&&!a(f)&&_e(()=>import("./D1l30uqp.js"),__vite__mapDeps([16,1,3,4,8,2,5,9,17,18,10,19]),import.meta.url).then(c=>{S(f,c.default,!0)}).catch(c=>{console.error("Failed to load DetailModal:",c)})});let N={searchQuery:"",selectedPlatforms:[],selectedGenres:[],selectedTiers:[],ratingRanges:{presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}};L.filterState.subscribe(c=>{N=c}),B(()=>{d&&(u&&clearTimeout(u),u=setTimeout(()=>{ne.writeToURLWithFilters(L)},300))}),B(()=>{const c=xe.url,m=c.searchParams.get("search")||"",E=c.searchParams.get("platforms")||"",C=c.searchParams.get("genres")||"",x=c.searchParams.get("tiers")||"",w=c.searchParams.get("ratingPresentation")||"",j=c.searchParams.get("ratingStory")||"",Q=c.searchParams.get("ratingGameplay")||"",q=c.searchParams.get("ratingTotal")||"",ee={searchQuery:m,selectedPlatforms:E?E.split(","):[],selectedGenres:C?C.split(","):[],selectedTiers:x?x.split(","):[],ratingRanges:{presentation:w?w.split(",").map(Number):[0,10],story:j?j.split(",").map(Number):[0,10],gameplay:Q?Q.split(",").map(Number):[0,10],total:q?q.split(",").map(Number):[0,20]}},X=JSON.stringify(ee),te=JSON.stringify(N);d&&X!==te&&L.readFromURL(xe.url.searchParams),L.readFromURL(xe.url.searchParams)});let D=W(ce([])),A=W(ce([])),R=W(ce([]));B(()=>{const c=L.selectedPlatforms.subscribe(C=>{S(D,C,!0)}),m=L.selectedGenres.subscribe(C=>{S(A,C,!0)}),E=L.selectedTiers.subscribe(C=>{S(R,C,!0)});return()=>{c(),m(),E()}});function z(){L.resetAllFilters(),L.searchQuery.set(""),ne.activeTab.set("all"),u&&clearTimeout(u),ne.writeToURLWithFilters(L),setTimeout(()=>{window.scrollTo({top:0,behavior:"smooth"}),requestAnimationFrame(()=>{window.scrollTo(0,0),document.documentElement.scrollTop=0})},200)}var Y=Zt();Be(c=>{var m=Jt();He.title="Gaming Tracker",p(c,m)});var $=l(Y);ot($,{});var H=y($,2),Z=l(H),h=l(Z);dt(h,{});var v=y(h,2);{var b=c=>{var m=Yt(),E=l(m),C=l(E);Re(C,{type:"platforms",label:"Platforms",get options(){return a(M).platforms},get selectedOptions(){return a(D)}});var x=y(C,2);Re(x,{type:"genres",label:"Genres",get options(){return a(M).genres},get selectedOptions(){return a(A)}});var w=y(x,2);Re(w,{type:"tiers",label:"Tiers",get options(){return a(M).tiers},get selectedOptions(){return a(R)}});var j=y(w,2);Xt(j,{});var Q=y(j,2);Q.__click=z;var q=y(Q,2),ee=l(q);ee.__click=[Kt];var X=l(ee);{var te=P=>{yt(P,{size:18,class:"text-gray-600 dark:text-gray-400"})},g=P=>{_t(P,{size:18,class:"text-gray-600 dark:text-gray-400"})};U(X,P=>{a(G)==="gallery"?P(te):P(g,!1)})}s(ee),s(q),s(E),s(m),re(()=>J(ee,"title",a(G)==="gallery"?"Switch to table view":"Switch to gallery view")),p(c,m)};U(v,c=>{a(V)!=="tierlist"&&c(b)})}s(Z),s(H);var T=y(H,2),i=l(T),k=l(i);Ue(k,()=>e.children??Qe),s(i),s(T);var _=y(T,2);{var F=c=>{var m=ie(),E=se(m);De(E,()=>a(f),(C,x)=>{x(C,{})}),p(c,m)};U(_,c=>{a(f)&&c(F)})}s(Y),p(n,Y),me(),o()}de(["click"]);export{Lt as T,ca as _,ua as a};
