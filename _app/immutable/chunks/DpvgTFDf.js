const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./Do76yaGS.js","./DsnmJJEf.js","./C9Mez9kv.js","./BTl-r8Ka.js","./C1BGY0Lw.js","./BBnib6OM.js","./CqkABsPb.js","./Co61yfe2.js","./v8nCCNZF.js","./ZzqxdPVN.js","./pYK4pWqL.js","../assets/GameCard.B135ZzL1.css","./B6Y-bhgy.js","./6yG1SeKF.js","./B-Uu1Pw7.js","./DxDwkUS9.js","./DZ7-RxkB.js","./CF2bhIzd.js","../assets/TierListView.3Uw_1Mu0.css","./C2yOblDl.js","./BPGTXCE4.js","../assets/DetailModal.Cpb9Cm9V.css"])))=>i.map(i=>d[i]);
import{g as Re,e as Ee}from"./C1BGY0Lw.js";import{_ as _e,c as je}from"./PVm06Bq_.js";import"./DsnmJJEf.js";import{o as de,p as ve,v as J,x as ce,y as H,z as P,f as A,t as re,b as p,c as me,d as o,s as y,g as s,j as t,k as fe,h as ue,af as Ie,i as ie,a as se,av as Ue,C as Be,aV as He,$ as qe,D as Ke,R as We}from"./C9Mez9kv.js";import{a as Ce,b as Ne,i as q,l as ge,s as be,p as we}from"./BTl-r8Ka.js";import{c as Y,d as ke,g as Oe,e as Xe,f as Je,T as Qe,I as pe,s as he,h as De,C as ze,r as Ge,b as ye,i as Ae,P as Ye,N as Ze,G as $e,m as Ve}from"./Co61yfe2.js";import{p as xe}from"./DS-UdytZ.js";import{a as ne,f as C}from"./DxDwkUS9.js";import{b as Le}from"./BPGTXCE4.js";import"./v8nCCNZF.js";async function et(i){return await Re.loadGames(i),{}}const oa=Object.freeze(Object.defineProperty({__proto__:null,load:et},Symbol.toStringTag,{value:"Module"}));function tt(){ne.toggleTheme()}var at=A('<button type="button" class="theme-toggle svelte-1cmi4dh"><div class="icon-container svelte-1cmi4dh"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></div></button>');function rt(i,e){ve(e,!0);let a=J(ce(typeof document<"u"&&document.documentElement.classList.contains("light")?"light":"dark"));H(()=>ne.theme.subscribe(N=>{P(a,N,!0)}));var r=at();r.__click=[tt];var c=o(r),d=o(c);let u;var f=y(d,2);let L;s(c),s(r),re((G,N)=>{Y(r,"aria-label",t(a)==="dark"?"Switch to light mode":"Switch to dark mode"),Y(r,"title",t(a)==="dark"?"Switch to light mode":"Switch to dark mode"),u=ke(d,0,"sun-icon svelte-1cmi4dh",null,u,G),L=ke(f,0,"moon-icon svelte-1cmi4dh",null,L,N)},[()=>({visible:t(a)==="light",hidden:t(a)==="dark"}),()=>({visible:t(a)==="dark",hidden:t(a)==="light"})]),p(i,r),me()}de(["click"]);var nt=(i,e,a)=>e(t(a)),it=(i,e,a)=>e(t(a).id),st=A('<span class="tab-count svelte-1elxaub"> </span>'),ot=A('<li class="tab-item svelte-1elxaub" role="presentation"><button type="button" role="tab"><span class="tab-label svelte-1elxaub"> </span> <!></button></li>'),lt=A('<header class="header svelte-1elxaub"><div class="header-background svelte-1elxaub"></div> <div class="header-content container mx-auto px-6 svelte-1elxaub"><div class="header-left svelte-1elxaub"><button class="logo svelte-1elxaub" aria-label="Go to homepage and reset all filters"><picture class="logo-image svelte-1elxaub"><source srcset="logo.webp" type="image/webp"/> <img src="logo.png" alt="Gaming Tracker Logo"/></picture></button></div> <div class="header-right"><!></div></div> <nav class="navigation-tabs svelte-1elxaub" aria-label="Game navigation"><div class="navigation-background svelte-1elxaub"></div> <div class="navigation-content svelte-1elxaub"><ul class="tabs-list svelte-1elxaub" role="tablist"></ul></div></nav></header>');function ct(i,e){ve(e,!0);const a=()=>Ce(u,"$activeTab",c),r=()=>Ce(f,"$filteredGamesStore",c),[c,d]=Ne();H(()=>ne.theme.subscribe(()=>{}));const{activeTab:u}=ne,f=C.createFilteredGamesStore();if(typeof window<"u"){const v=localStorage.getItem("gaming-tracker-active-tab"),b=window.location.hash.replace("#","");let M=v||"all";b==="completed"?M="completed":b==="planned"?M="planned":b==="tierlist"&&(M="tierlist"),M!==a()&&u.set(M)}const L=fe(()=>[{id:"all",label:"Games",route:"/",count:r().totalCount},{id:"completed",label:"Completed",route:"completed",count:r().completedCount},{id:"planned",label:"Planned",route:"planned",count:r().plannedCount},{id:"tierlist",label:"Tier List",route:"tierlist",count:null}]);function G(){C.resetAllFilters(),u.set("all"),typeof window<"u"&&window.location&&window.history.replaceState(null,"",window.location.pathname+window.location.search),typeof window<"u"&&window.scrollTo({top:0,behavior:"smooth"})}function N(v){if(v.id!==a()&&(u.set(v.id),typeof window<"u")){const b=v.id==="all"?"":`#${v.id}`;window.history.replaceState(null,"",`${window.location.pathname}${b}`)}}function D(v){v==="all"?_e(()=>import("./Do76yaGS.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):v==="completed"?_e(()=>import("./B6Y-bhgy.js"),__vite__mapDeps([12,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):v==="planned"?_e(()=>import("./6yG1SeKF.js"),__vite__mapDeps([13,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):v==="tierlist"&&_e(()=>import("./B-Uu1Pw7.js"),__vite__mapDeps([14,1,2,3,4,7,8,9,5,15,10,6,11,16,17,18]),import.meta.url)}var V=lt(),O=y(o(V),2),S=o(O),z=o(S);z.__click=G,s(S);var Z=y(S,2),te=o(Z);rt(te,{}),s(Z),s(O);var K=y(O,2),ee=y(o(K),2),h=o(ee);Ee(h,21,()=>t(L),v=>v.id,(v,b)=>{var M=ot(),n=o(M);let k;n.__click=[nt,N,b],n.__mouseover=[it,D,b];var _=o(n),I=o(_,!0);s(_);var l=y(_,2);{var m=E=>{var R=st(),x=o(R);s(R),re(()=>ue(x,`(${t(b).count??""})`)),p(E,R)};q(l,E=>{t(b).count!==null&&E(m)})}s(n),s(M),re(E=>{k=ke(n,1,"tab-button svelte-1elxaub",null,k,E),Y(n,"aria-selected",a()===t(b).id),Y(n,"tabindex",a()===t(b).id?0:-1),ue(I,t(b).label)},[()=>({active:a()===t(b).id})]),Ie("focus",n,()=>D(t(b).id)),p(v,M)}),s(h),s(ee),s(K),s(V),p(i,V),me(),d()}de(["click","mouseover"]);var ut=A('<button type="button" class="clear-button svelte-yyldap" aria-label="Clear search"><span aria-hidden="true">×</span></button>'),dt=A('<div class="search-bar-container svelte-yyldap"><div class="search-bar svelte-yyldap"><span class="search-icon svelte-yyldap" aria-hidden="true">🔍</span> <input type="text" placeholder="Search games..." class="search-input svelte-yyldap" aria-label="Search games" autocomplete="off" spellcheck="false"/> <!></div></div>');function vt(i,e){ve(e,!0);let a,r,c=J("");H(()=>C.subscribe(z=>{z&&P(c,z.searchTerm,!0)})),H(()=>{a&&a.focus()});function d(S){const Z=S.target.value;r&&clearTimeout(r),r=setTimeout(()=>{C.setSearchTerm(Z),C.writeToURL()},300)}function u(){a&&(a.value="",a.focus()),C.setSearchTerm(""),C.writeToURL(),r&&clearTimeout(r)}function f(S){S.key==="Escape"&&a&&a.select()}function L(S){S.key==="Escape"&&a&&(S.preventDefault(),a.focus(),a.select())}H(()=>(document.addEventListener("keydown",L),()=>{document.removeEventListener("keydown",L)}));var G=dt(),N=o(G),D=y(o(N),2);D.__input=d,D.__keydown=f,Le(D,S=>a=S,()=>a);var V=y(D,2);{var O=S=>{var z=ut();z.__click=u,p(S,z)};q(V,S=>{t(c)&&S(O)})}s(N),s(G),p(i,G),me()}de(["input","keydown","click"]);function mt(i){return Xe[i]||"bg-gray-600 text-white"}function ft(i){return Je[i]||"bg-gray-600 text-white"}function gt(i){const e=Oe(i);return Qe[e]||"bg-gray-600 text-white"}function bt(i){const e=new Set,a=new Set,r=new Set;return i.forEach(c=>{c.platform&&e.add(c.platform),c.genre&&a.add(c.genre),c.tier&&r.add(Oe(c.tier))}),{platforms:Array.from(e).sort(),genres:Array.from(a).sort(),tiers:Array.from(r).sort()}}function pt(i,e){const a=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2"}],["path",{d:"M3 9h18"}],["path",{d:"M3 15h18"}],["path",{d:"M9 3v18"}],["path",{d:"M15 3v18"}]];pe(i,be({name:"grid-3x3"},()=>a,{get iconNode(){return r},children:(c,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(c,u)},$$slots:{default:!0}}))}function ht(i,e){const a=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M3 5h.01"}],["path",{d:"M3 12h.01"}],["path",{d:"M3 19h.01"}],["path",{d:"M8 5h13"}],["path",{d:"M8 12h13"}],["path",{d:"M8 19h13"}]];pe(i,be({name:"list"},()=>a,{get iconNode(){return r},children:(c,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(c,u)},$$slots:{default:!0}}))}function _t(i,e){const a=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];pe(i,be({name:"monitor"},()=>a,{get iconNode(){return r},children:(c,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(c,u)},$$slots:{default:!0}}))}function yt(i,e){const a=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]];pe(i,be({name:"star"},()=>a,{get iconNode(){return r},children:(c,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(c,u)},$$slots:{default:!0}}))}function xt(i,e){const a=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor"}]];pe(i,be({name:"tag"},()=>a,{get iconNode(){return r},children:(c,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(c,u)},$$slots:{default:!0}}))}function wt(i,e){const a=ge(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18"}],["path",{d:"M4 22h16"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6"}]];pe(i,be({name:"trophy"},()=>a,{get iconNode(){return r},children:(c,d)=>{var u=ie(),f=se(u);he(f,e,"default",{}),p(c,u)},$$slots:{default:!0}}))}var kt=A('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1uy8f65"> </span>'),Lt=(i,e,a)=>e(a),Mt=A('<button type="button"> </button>'),Tt=(i,e)=>{i.stopPropagation(),e()},Pt=A('<div class="filter-actions mt-3 flex justify-center svelte-1uy8f65"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),St=A('<div class="empty-state py-2 text-center svelte-1uy8f65"><span class="text-muted-foreground text-sm"> </span></div>'),Rt=A('<div class="filter-options-dropdown svelte-1uy8f65"><div class="filter-options-section svelte-1uy8f65"><div class="filter-options-grid svelte-1uy8f65"></div> <!> <!></div></div>'),Ct=A('<div class="filter-dropdown svelte-1uy8f65"><button><!> <span class="filter-label svelte-1uy8f65"> </span> <!></button> <!></div>');function Se(i,e){ve(e,!0);let a=we(e,"selectedOptions",19,()=>[]),r=J(!1),c;function d(n){const k=n.target,_=document.querySelector(".filter-options-dropdown");_&&_.contains(k)||c&&!c.contains(k)&&P(r,!1)}H(()=>{if(t(r))return document.addEventListener("click",d),()=>{document.removeEventListener("click",d)}});function u(n){e.type==="platforms"?C.togglePlatform(n):e.type==="genres"?C.toggleGenre(n):e.type==="tiers"&&C.toggleTier(n)}function f(){a().forEach(n=>{e.type==="platforms"?C.removePlatform(n):e.type==="genres"?C.removeGenre(n):e.type==="tiers"&&C.removeTier(n)})}function L(n){return e.type==="platforms"?mt(n):e.type==="genres"?ft(n):e.type==="tiers"?gt(n):"bg-gray-600 text-white"}function G(){return a().length===0?"bg-surface hover:bg-accent hover:text-accent-foreground border-0":"bg-accent text-accent-foreground border-0"}function N(n){n.key==="Escape"?(P(r,!1),n.preventDefault()):(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),P(r,!t(r)))}function D(){return{"aria-expanded":t(r),"aria-haspopup":"listbox","aria-label":`Filter by ${e.label.toLowerCase()}`}}var V=Ct(),O=o(V),S=()=>P(r,!t(r));De(O,(n,k,_)=>({type:"button",class:`filter-button ${n??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:S,onkeydown:N,...k,[ze]:_}),[G,D,()=>({selected:a().length>0})],void 0,"svelte-1uy8f65");var z=o(O);{var Z=n=>{_t(n,{size:16,class:"text-gray-600 dark:text-gray-400"})},te=n=>{var k=ie(),_=se(k);{var I=m=>{xt(m,{size:16,class:"text-gray-600 dark:text-gray-400"})},l=m=>{var E=ie(),R=se(E);{var x=w=>{wt(w,{size:16,class:"text-gray-600 dark:text-gray-400"})};q(R,w=>{e.type==="tiers"&&w(x)},!0)}p(m,E)};q(_,m=>{e.type==="genres"?m(I):m(l,!1)},!0)}p(n,k)};q(z,n=>{e.type==="platforms"?n(Z):n(te,!1)})}var K=y(z,2),ee=o(K);s(K);var h=y(K,2);{var v=n=>{var k=kt(),_=o(k,!0);s(k),re(()=>ue(_,a().length)),p(n,k)};q(h,n=>{a().length>0&&n(v)})}s(O);var b=y(O,2);{var M=n=>{var k=Rt(),_=o(k),I=o(_);Ee(I,20,()=>e.options,x=>x,(x,w)=>{var j=Mt();j.__click=[Lt,u,w];var W=o(j,!0);s(j),re((X,F,B)=>{ke(j,1,`filter-option-item ${X??""} ${F??""}`,"svelte-1uy8f65"),ue(W,B)},[()=>L(w),()=>a().includes(w)?"selected":"",()=>e.type==="tiers"?Oe(w):w]),p(x,j)}),s(I);var l=y(I,2);{var m=x=>{var w=Pt(),j=o(w);j.__click=[Tt,f],s(w),p(x,w)};q(l,x=>{a().length>0&&x(m)})}var E=y(l,2);{var R=x=>{var w=St(),j=o(w),W=o(j);s(j),s(w),re(X=>ue(W,`No ${X??""} available`),[()=>e.label.toLowerCase()]),p(x,w)};q(E,x=>{e.options.length===0&&x(R)})}s(_),s(k),p(n,k)};q(b,n=>{t(r)&&n(M)})}s(V),Le(V,n=>c=n,()=>c),re(()=>ue(ee,`Filter by ${e.label??""}`)),p(i,V),me()}de(["click"]);function Et(i,e,a){const r=i.target,c=parseInt(r.value);e(c,t(a),!0)}function Ot(i,e,a){const r=i.target,c=parseInt(r.value);e(t(a),c,!1)}var Gt=A('<span class="filter-icon svelte-1ugjrx4" aria-label="Rating filter">🏆</span>'),At=(i,e)=>{i.stopPropagation(),e()},Vt=A('<button type="button" class="reset-button svelte-1ugjrx4" title="Reset to default range">Reset</button>'),jt=(i,e)=>e(i,"min"),Nt=(i,e)=>e(i,"max"),Dt=A('<div class="rating-slider svelte-1ugjrx4"><div class="slider-header svelte-1ugjrx4"><span class="slider-label svelte-1ugjrx4"><!> </span> <!></div> <div class="slider-container svelte-1ugjrx4"><div class="dual-slider-row svelte-1ugjrx4"><div class="slider-track svelte-1ugjrx4" role="application" aria-label="Rating range slider track"><div class="slider-fill svelte-1ugjrx4"><div class="drag-handle drag-handle-left svelte-1ugjrx4" role="button" tabindex="0"></div> <div class="drag-handle drag-handle-right svelte-1ugjrx4" role="button" tabindex="0"></div></div> <input type="range" class="slider-thumb slider-thumb-min svelte-1ugjrx4"/> <input type="range" class="slider-thumb slider-thumb-max svelte-1ugjrx4"/></div></div></div></div>');function zt(i,e){ve(e,!0);let a=we(e,"step",3,1),r=we(e,"disabled",3,!1),c=we(e,"onRangeChange",3,()=>{});function d(){const g=e.label.toLowerCase();return g.includes("presentation")?Ye:g.includes("story")?Ze:g.includes("gameplay")?$e:null}function u(){const g=e.label.toLowerCase();return g.includes("presentation")?"text-cyan-500":g.includes("story")?"text-amber-600":g.includes("gameplay")?"text-pink-500":"text-gray-600"}let f=J(ce(e.minValue)),L=J(ce(e.maxValue)),G,N=J(!1),D=J(null);H(()=>{P(f,e.minValue,!0),P(L,e.maxValue,!0)});function V(g,T,ae){return Math.min(Math.max(g,T),ae)}function O(g,T,ae=!1){if(r())return;let Q=V(g,e.minLimit,e.maxLimit),U=V(T,e.minLimit,e.maxLimit);ae?Q=Math.min(Q,U):U=Math.max(U,Q),Q=Math.round(Q/a())*a(),U=Math.round(U/a())*a(),P(f,Q,!0),P(L,U,!0),c()(Q,U)}function S(){O(e.minLimit,e.maxLimit)}function z(g,T){r()||(P(D,T,!0),P(N,!0),document.addEventListener("mousemove",te),document.addEventListener("mouseup",K),g.preventDefault())}function Z(g){if(r()||!G)return;const T=G.getBoundingClientRect(),ae=g.clientX-T.left,Q=T.width,U=ae/Q,le=ee()/100,oe=h()/100,Me=le,Te=oe;if(U>=Me&&U<=Te){const Pe=Math.abs(U-le),Fe=Math.abs(U-oe);P(D,Pe<=Fe?"min":"max",!0),P(N,!0),document.addEventListener("mousemove",te),document.addEventListener("mouseup",K),g.preventDefault()}}function te(g){if(!t(N)||!G||r())return;const T=G.getBoundingClientRect(),ae=g.clientX-T.left,Q=T.width,U=Math.max(0,Math.min(1,ae/Q)),le=Math.round((U*(e.maxLimit-e.minLimit)+e.minLimit)/a())*a(),oe=V(le,e.minLimit,e.maxLimit);t(D)==="min"?O(oe,t(L),!0):t(D)==="max"&&O(t(f),oe,!1)}function K(){P(N,!1),P(D,null),document.removeEventListener("mousemove",te),document.removeEventListener("mouseup",K)}function ee(){return(t(f)-e.minLimit)/(e.maxLimit-e.minLimit)*100}function h(){return(t(L)-e.minLimit)/(e.maxLimit-e.minLimit)*100}function v(){return t(f)===e.minLimit&&t(L)===e.maxLimit}function b(){return"#6b7280"}var M=Dt(),n=o(M),k=o(n),_=o(k);{var I=g=>{const T=fe(d);var ae=ie(),Q=se(ae);{let U=fe(u);je(Q,()=>t(T),(le,oe)=>{oe(le,{get class(){return`filter-icon ${t(U)??""}`},get"aria-label"(){return`${e.label??""} filter`},size:20})})}p(g,ae)},l=g=>{var T=Gt();p(g,T)};q(_,g=>{d()?g(I):g(l,!1)})}var m=y(_);s(k);var E=y(k,2);{var R=g=>{var T=Vt();T.__click=[At,S],re(()=>T.disabled=r()),p(g,T)};q(E,g=>{v()||g(R)})}s(n);var x=y(n,2),w=o(x),j=o(w);j.__mousedown=Z;var W=o(j),X=o(W);X.__mousedown=[jt,z];var F=y(X,2);F.__mousedown=[Nt,z],s(W);var B=y(W,2);Ge(B),B.__input=[Et,O,L];var $=y(B,2);Ge($),$.__input=[Ot,O,f],s(j),s(w),s(x),Le(x,g=>G=g,()=>G),s(M),re((g,T,ae,Q,U,le,oe,Me,Te,Pe)=>{ye(M,`--min-color: ${g??""}; --max-color: ${T??""}`),ue(m,` ${e.label??""}
			${t(f)??""} - ${t(L)??""}`),ye(W,`left: ${ae??""}%; width: ${Q??""}%`),ye(X,`background-color: ${U??""}`),Y(X,"aria-label",`Drag to adjust minimum ${le??""} value`),ye(F,`background-color: ${oe??""}`),Y(F,"aria-label",`Drag to adjust maximum ${Me??""} value`),Y(B,"min",e.minLimit),Y(B,"max",e.maxLimit),Y(B,"step",a()),Ae(B,t(f)),B.disabled=r(),Y(B,"aria-label",`Minimum ${Te??""} rating`),Y($,"min",e.minLimit),Y($,"max",e.maxLimit),Y($,"step",a()),Ae($,t(L)),$.disabled=r(),Y($,"aria-label",`Maximum ${Pe??""} rating`)},[b,b,ee,()=>h()-ee(),b,()=>e.label.toLowerCase(),b,()=>e.label.toLowerCase(),()=>e.label.toLowerCase(),()=>e.label.toLowerCase()]),p(i,M),me()}de(["click","mousedown","input"]);var Ft=A('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1vf89kc"> </span>'),It=A('<div class="rating-slider-item svelte-1vf89kc"><!></div>'),Ut=(i,e)=>{i.stopPropagation(),e()},Bt=A('<div class="filter-actions mt-4 flex justify-center svelte-1vf89kc"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),Ht=A('<div class="ratings-filter-dropdown svelte-1vf89kc"><div class="filter-options-section svelte-1vf89kc"><div class="filter-options-grid svelte-1vf89kc"></div> <!></div></div>'),qt=A('<div class="ratings-filter svelte-1vf89kc"><button><!> <span class="filter-label svelte-1vf89kc">Filter by Ratings</span> <!></button> <!></div>');function Kt(i,e){ve(e,!0);const a={presentation:{label:"Presentation",maxValue:10},story:{label:"Story",maxValue:10},gameplay:{label:"Gameplay",maxValue:10},total:{label:"Score",maxValue:20}};let r=J(!1),c,d=J(ce({presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}));H(()=>C.ratingRanges.subscribe(v=>{P(d,v,!0)}));function u(h){const v=h.target,b=document.querySelector(".ratings-filter-dropdown");b&&b.contains(v)||c&&!c.contains(v)&&P(r,!1)}H(()=>{if(t(r))return document.addEventListener("click",u),()=>{document.removeEventListener("click",u)}});function f(){C.setRatingsRange([0,10])}function L(){return t(d).presentation[0]>0||t(d).presentation[1]<10||t(d).story[0]>0||t(d).story[1]<10||t(d).gameplay[0]>0||t(d).gameplay[1]<10||t(d).total[0]>0||t(d).total[1]<20}function G(){return L()?"bg-accent text-accent-foreground border-0":"bg-surface hover:bg-accent hover:text-accent-foreground border-0"}function N(h){h.key==="Escape"?(P(r,!1),h.preventDefault()):(h.key==="Enter"||h.key===" ")&&(h.preventDefault(),P(r,!t(r)))}function D(){return{"aria-expanded":t(r),"aria-haspopup":"listbox","aria-label":"Filter by ratings"}}var V=qt(),O=o(V),S=()=>P(r,!t(r));De(O,(h,v,b)=>({type:"button",class:`filter-button ${h??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:S,onkeydown:N,...v,[ze]:b}),[G,D,()=>({selected:L()})],void 0,"svelte-1vf89kc");var z=o(O);yt(z,{size:16,class:"text-gray-600 dark:text-gray-400"});var Z=y(z,4);{var te=h=>{var v=Ft(),b=o(v,!0);s(v),re(M=>ue(b,M),[()=>[t(d).presentation,t(d).story,t(d).gameplay,t(d).total].filter(([M,n],k)=>{const _=[[0,10],[0,10],[0,10],[0,20]];return M>_[k][0]||n<_[k][1]}).length]),p(h,v)};q(Z,h=>{L()&&h(te)})}s(O);var K=y(O,2);{var ee=h=>{var v=Ht(),b=o(v),M=o(b);Ee(M,21,()=>Object.entries(a),([_,I])=>_,(_,I)=>{var l=fe(()=>Ue(t(I),2));let m=()=>t(l)[0],E=()=>t(l)[1];const R=fe(m),x=fe(()=>t(d)[t(R)]);var w=It(),j=o(w);zt(j,{get label(){return E().label},get minValue(){return t(x)[0]},get maxValue(){return t(x)[1]},step:1,minLimit:0,get maxLimit(){return E().maxValue},onRangeChange:(W,X)=>{const F={...t(d),[t(R)]:[W,X]},B=(F.presentation[0]+F.story[0]+F.gameplay[0])/3,$=(F.presentation[1]+F.story[1]+F.gameplay[1])/3;C.setRatingsRange([Math.round(B),Math.round($)])}}),s(w),p(_,w)}),s(M);var n=y(M,2);{var k=_=>{var I=Bt(),l=o(I);l.__click=[Ut,f],s(I),p(_,I)};q(n,_=>{L()&&_(k)})}s(b),s(v),p(h,v)};q(K,h=>{t(r)&&h(ee)})}s(V),Le(V,h=>c=h,()=>c),p(i,V),me()}de(["click"]);function Wt(){ne.toggleViewMode()}var Xt=A('<meta name="viewport" content="width=device-width, initial-scale=1.0"/>  <link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/> <link rel="dns-prefetch" href="//fonts.googleapis.com"/> <link rel="dns-prefetch" href="//fonts.gstatic.com"/>',1),Jt=A('<div class="flex flex-col items-center gap-4"><div class="flex flex-wrap items-center justify-center gap-3"><!> <!> <!> <!> <button class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors svelte-12qhfyh" title="Reset all filters">↻ Reset</button> <div class="view-toggle-container"><button class="view-toggle-button flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"><!></button></div></div></div>'),Qt=A('<div class="bg-background text-foreground min-h-screen"><!> <section class="filter-section sticky top-[104px] z-30 md:top-[110px] svelte-12qhfyh"><div class="container mx-auto space-y-4 px-6 py-4"><!> <!></div></section> <main style="background-color: var(--color-background);" class="px-6 pt-0 pb-6"><div class="container mx-auto"><!></div></main> <!></div>');function la(i,e){ve(e,!0);const a=()=>Ce(Ve,"$modalStore",r),[r,c]=Ne();let d=!1,u,f=J(null),L=J(ce({platforms:[],genres:[],tiers:[]})),G=J("gallery"),N=J("all");H(()=>Re.subscribe(m=>{P(L,bt(m),!0)})),H(()=>ne.viewMode.subscribe(m=>{P(G,m,!0)})),H(()=>ne.activeTab.subscribe(m=>{P(N,m,!0)})),H(()=>{if(!d){const l=xe.url.searchParams.get("game");l&&setTimeout(()=>{const m=Re.getGameBySlug(l);m&&Ve.openViewModal(m)},100),d=!0}}),H(()=>{a().isOpen&&!t(f)&&_e(()=>import("./C2yOblDl.js"),__vite__mapDeps([19,1,2,3,7,8,4,9,20,15,10,21]),import.meta.url).then(l=>{P(f,l.default,!0)}).catch(l=>{console.error("Failed to load DetailModal:",l)})});let D=null;C.subscribe(l=>{D=l}),H(()=>{d&&(u&&clearTimeout(u),u=setTimeout(()=>{ne.writeToURLWithFilters(C)},300))}),H(()=>{const l=xe.url,m=l.searchParams.get("search")||"",E=l.searchParams.get("platforms")||"",R=l.searchParams.get("genres")||"",x=l.searchParams.get("tiers")||"",w=l.searchParams.get("ratingPresentation")||"",j=l.searchParams.get("ratingStory")||"",W=l.searchParams.get("ratingGameplay")||"",X=l.searchParams.get("ratingTotal")||"",F={searchQuery:m,selectedPlatforms:E?E.split(","):[],selectedGenres:R?R.split(","):[],selectedTiers:x?x.split(","):[],ratingRanges:{presentation:w?w.split(",").map(Number):[0,10],story:j?j.split(",").map(Number):[0,10],gameplay:W?W.split(",").map(Number):[0,10],total:X?X.split(",").map(Number):[0,20]}},B=JSON.stringify(F),$=JSON.stringify(D);d&&B!==$&&C.readFromURL(xe.url.searchParams),C.readFromURL(xe.url.searchParams)});let V=J(ce([])),O=J(ce([])),S=J(ce([]));H(()=>{const l=C.selectedPlatforms.subscribe(R=>{P(V,R,!0)}),m=C.selectedGenres.subscribe(R=>{P(O,R,!0)}),E=C.selectedTiers.subscribe(R=>{P(S,R,!0)});return()=>{l(),m(),E()}});function z(){C.resetAllFilters(),C.setSearchTerm(""),ne.activeTab.set("all"),u&&clearTimeout(u),ne.writeToURLWithFilters(C),setTimeout(()=>{window.scrollTo({top:0,behavior:"smooth"}),requestAnimationFrame(()=>{window.scrollTo(0,0),document.documentElement.scrollTop=0})},200)}var Z=Qt();Be(l=>{var m=Xt();qe.title="Gaming Tracker",Ke(8),p(l,m)});var te=o(Z);ct(te,{});var K=y(te,2),ee=o(K),h=o(ee);vt(h,{});var v=y(h,2);{var b=l=>{var m=Jt(),E=o(m),R=o(E);Se(R,{type:"platforms",label:"Platforms",get options(){return t(L).platforms},get selectedOptions(){return t(V)}});var x=y(R,2);Se(x,{type:"genres",label:"Genres",get options(){return t(L).genres},get selectedOptions(){return t(O)}});var w=y(x,2);Se(w,{type:"tiers",label:"Tiers",get options(){return t(L).tiers},get selectedOptions(){return t(S)}});var j=y(w,2);Kt(j,{});var W=y(j,2);W.__click=z;var X=y(W,2),F=o(X);F.__click=[Wt];var B=o(F);{var $=T=>{ht(T,{size:18,class:"text-gray-600 dark:text-gray-400"})},g=T=>{pt(T,{size:18,class:"text-gray-600 dark:text-gray-400"})};q(B,T=>{t(G)==="gallery"?T($):T(g,!1)})}s(F),s(X),s(E),s(m),re(()=>Y(F,"title",t(G)==="gallery"?"Switch to table view":"Switch to gallery view")),p(l,m)};q(v,l=>{t(N)!=="tierlist"&&l(b)})}s(ee),s(K);var M=y(K,2),n=o(M),k=o(n);He(k,()=>e.children??We),s(n),s(M);var _=y(M,2);{var I=l=>{var m=ie(),E=se(m);je(E,()=>t(f),(R,x)=>{x(R,{})}),p(l,m)};q(_,l=>{t(f)&&l(I)})}s(Z),p(i,Z),me(),c()}de(["click"]);export{wt as T,oa as _,la as a};
