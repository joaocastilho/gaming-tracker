const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./CokkMXAY.js","./DsnmJJEf.js","./DoUP4Vb6.js","./7_uHGuRw.js","./EHyETUk-.js","./CUTeqbuk.js","./Cdyf70MY.js","./DuaReox9.js","./C2zytS0B.js","./CMB-IjVr.js","./CSM1neTC.js","../assets/GameCard.B135ZzL1.css","./DL6PjIgu.js","./M3UJxMBi.js","./6C-q8fSR.js","./B6K266Eh.js","../assets/TierListView.CADzuQX_.css","./ytuguJH7.js","./CP9ppwsE.js","./CkUnP1cq.js","../assets/DetailModal.Cpb9Cm9V.css"])))=>i.map(i=>d[i]);
import{g as Re,e as Ee}from"./7_uHGuRw.js";import{_ as ge,c as Ve}from"./CJJal6Za.js";import"./DsnmJJEf.js";import{n as de,p as ve,o as K,v as le,w as U,x as M,f as O,t as re,b as h,c as me,d as o,s as x,g as l,i as t,j as fe,h as oe,ag as Ie,ae as ce,a as ue,af as Ue,z as Be,aV as He,$ as qe,A as We,P as Ke}from"./DoUP4Vb6.js";import{a as Ce,b as De,i as B,l as ye,s as xe,p as he}from"./Cdyf70MY.js";import{p as be}from"./CdI5TGdO.js";import{d as J,s as _e,g as Oe,e as Xe,f as Je,T as Qe,I as we,b as ke,h as Fe,C as Ne,r as Ae,c as pe,i as Ge,P as Ye,N as Ze,G as $e,m as je}from"./DuaReox9.js";import{a as ie,f as L}from"./CkUnP1cq.js";import{b as Le}from"./CP9ppwsE.js";import"./C2zytS0B.js";async function et(i){return await Re.loadGames(i),{}}const na=Object.freeze(Object.defineProperty({__proto__:null,load:et},Symbol.toStringTag,{value:"Module"}));function tt(){ie.toggleTheme()}var at=O('<button type="button" class="theme-toggle svelte-1cmi4dh"><div class="icon-container svelte-1cmi4dh"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></div></button>');function rt(i,e){ve(e,!0);let a=K(le(typeof document<"u"&&document.documentElement.classList.contains("light")?"light":"dark"));U(()=>ie.theme.subscribe(F=>{M(a,F,!0)}));var r=at();r.__click=[tt];var c=o(r),u=o(c);let v;var b=x(u,2);let T;l(c),l(r),re((A,F)=>{J(r,"aria-label",t(a)==="dark"?"Switch to light mode":"Switch to dark mode"),J(r,"title",t(a)==="dark"?"Switch to light mode":"Switch to dark mode"),v=_e(u,0,"sun-icon svelte-1cmi4dh",null,v,A),T=_e(b,0,"moon-icon svelte-1cmi4dh",null,T,F)},[()=>({visible:t(a)==="light",hidden:t(a)==="dark"}),()=>({visible:t(a)==="dark",hidden:t(a)==="light"})]),h(i,r),me()}de(["click"]);var nt=(i,e,a)=>e(t(a)),it=(i,e,a)=>e(t(a).id),st=O('<span class="tab-count svelte-1elxaub"> </span>'),lt=O('<li class="tab-item svelte-1elxaub" role="presentation"><button type="button" role="tab"><span class="tab-label svelte-1elxaub"> </span> <!></button></li>'),ot=O('<header class="header svelte-1elxaub"><div class="header-background svelte-1elxaub"></div> <div class="header-content container mx-auto px-6 svelte-1elxaub"><div class="header-left svelte-1elxaub"><button class="logo svelte-1elxaub" aria-label="Go to homepage and reset all filters"><picture class="logo-image svelte-1elxaub"><source srcset="logo.webp" type="image/webp"/> <img src="logo.png" alt="Gaming Tracker Logo"/></picture></button></div> <div class="header-right"><!></div></div> <nav class="navigation-tabs svelte-1elxaub" aria-label="Game navigation"><div class="navigation-background svelte-1elxaub"></div> <div class="navigation-content svelte-1elxaub"><ul class="tabs-list svelte-1elxaub" role="tablist"></ul></div></nav></header>');function ct(i,e){ve(e,!0);const a=()=>Ce(v,"$activeTab",c),r=()=>Ce(b,"$filteredGamesStore",c),[c,u]=De();U(()=>ie.theme.subscribe(()=>{}));const{activeTab:v}=ie,b=L.createFilteredGamesStore();if(typeof window<"u"){const d=localStorage.getItem("gaming-tracker-active-tab"),m=window.location.hash.replace("#","");let S=d||"all";m==="completed"?S="completed":m==="planned"?S="planned":m==="tierlist"&&(S="tierlist"),S!==a()&&v.set(S)}const T=fe(()=>[{id:"all",label:"Games",route:"/",count:r().totalCount},{id:"completed",label:"Completed",route:"completed",count:r().completedCount},{id:"planned",label:"Planned",route:"planned",count:r().plannedCount},{id:"tierlist",label:"Tier List",route:"tierlist",count:null}]);function A(){L.resetAllFilters(),v.set("all"),typeof window<"u"&&window.location&&window.history.replaceState(null,"",window.location.pathname+window.location.search),typeof window<"u"&&window.scrollTo({top:0,behavior:"smooth"})}function F(d){if(d.id!==a()&&(v.set(d.id),typeof window<"u")){const m=d.id==="all"?"":`#${d.id}`;window.history.replaceState(null,"",`${window.location.pathname}${m}`)}}function N(d){d==="all"?ge(()=>import("./CokkMXAY.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):d==="completed"?ge(()=>import("./DL6PjIgu.js"),__vite__mapDeps([12,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):d==="planned"?ge(()=>import("./M3UJxMBi.js"),__vite__mapDeps([13,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):d==="tierlist"&&ge(()=>import("./6C-q8fSR.js"),__vite__mapDeps([14,1,2,6,3,7,8,9,4,10,5,11,15,16]),import.meta.url)}var G=ot(),C=x(o(G),2),R=o(C),j=o(R);j.__click=A,l(R);var Q=x(R,2),Y=o(Q);rt(Y,{}),l(Q),l(C);var H=x(C,2),Z=x(o(H),2),_=o(Z);Ee(_,21,()=>t(T),d=>d.id,(d,m)=>{var S=lt(),n=o(S);let w;n.__click=[nt,F,m],n.__mouseover=[it,N,m];var p=o(n),s=o(p,!0);l(p);var f=x(p,2);{var E=k=>{var z=st(),P=o(z);l(z),re(()=>oe(P,`(${t(m).count??""})`)),h(k,z)};B(f,k=>{t(m).count!==null&&k(E)})}l(n),l(S),re(k=>{w=_e(n,1,"tab-button svelte-1elxaub",null,w,k),J(n,"aria-selected",a()===t(m).id),J(n,"tabindex",a()===t(m).id?0:-1),oe(s,t(m).label)},[()=>({active:a()===t(m).id})]),Ie("focus",n,()=>N(t(m).id)),h(d,S)}),l(_),l(Z),l(H),l(G),h(i,G),me(),u()}de(["click","mouseover"]);var ut=O('<button type="button" class="clear-button svelte-yyldap" aria-label="Clear search"><span aria-hidden="true">×</span></button>'),dt=O('<div class="search-bar-container svelte-yyldap"><div class="search-bar svelte-yyldap"><span class="search-icon svelte-yyldap" aria-hidden="true">🔍</span> <input type="text" placeholder="Search games..." class="search-input svelte-yyldap" aria-label="Search games" autocomplete="off" spellcheck="false"/> <!></div></div>');function vt(i,e){ve(e,!0);let a,r,c=K("");U(()=>L.subscribe(j=>{j&&M(c,j.searchTerm,!0)})),U(()=>{a&&a.focus()});function u(R){const Q=R.target.value;r&&clearTimeout(r),r=setTimeout(()=>{L.setSearchTerm(Q),L.writeToURL()},300)}function v(){a&&(a.value="",a.focus()),L.setSearchTerm(""),L.writeToURL(),r&&clearTimeout(r)}function b(R){R.key==="Escape"&&a&&a.select()}function T(R){R.key==="Escape"&&a&&(R.preventDefault(),a.focus(),a.select())}U(()=>(document.addEventListener("keydown",T),()=>{document.removeEventListener("keydown",T)}));var A=dt(),F=o(A),N=x(o(F),2);N.__input=u,N.__keydown=b,Le(N,R=>a=R,()=>a);var G=x(N,2);{var C=R=>{var j=ut();j.__click=v,h(R,j)};B(G,R=>{t(c)&&R(C)})}l(F),l(A),h(i,A),me()}de(["input","keydown","click"]);function mt(i){return Xe[i]||"bg-gray-600 text-white"}function ft(i){return Je[i]||"bg-gray-600 text-white"}function gt(i){const e=Oe(i);return Qe[e]||"bg-gray-600 text-white"}function bt(i){const e=new Set,a=new Set,r=new Set;return i.forEach(c=>{c.platform&&e.add(c.platform),c.genre&&a.add(c.genre),c.tier&&r.add(Oe(c.tier))}),{platforms:Array.from(e).sort(),genres:Array.from(a).sort(),tiers:Array.from(r).sort()}}function pt(i,e){const a=ye(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];we(i,xe({name:"monitor"},()=>a,{get iconNode(){return r},children:(c,u)=>{var v=ce(),b=ue(v);ke(b,e,"default",{}),h(c,v)},$$slots:{default:!0}}))}function ht(i,e){const a=ye(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]];we(i,xe({name:"star"},()=>a,{get iconNode(){return r},children:(c,u)=>{var v=ce(),b=ue(v);ke(b,e,"default",{}),h(c,v)},$$slots:{default:!0}}))}function _t(i,e){const a=ye(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor"}]];we(i,xe({name:"tag"},()=>a,{get iconNode(){return r},children:(c,u)=>{var v=ce(),b=ue(v);ke(b,e,"default",{}),h(c,v)},$$slots:{default:!0}}))}function yt(i,e){const a=ye(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18"}],["path",{d:"M4 22h16"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6"}]];we(i,xe({name:"trophy"},()=>a,{get iconNode(){return r},children:(c,u)=>{var v=ce(),b=ue(v);ke(b,e,"default",{}),h(c,v)},$$slots:{default:!0}}))}var xt=O('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1uy8f65"> </span>'),wt=(i,e,a)=>e(a),kt=O('<button type="button"> </button>'),Lt=(i,e)=>{i.stopPropagation(),e()},Tt=O('<div class="filter-actions mt-3 flex justify-center svelte-1uy8f65"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),Pt=O('<div class="empty-state py-2 text-center svelte-1uy8f65"><span class="text-muted-foreground text-sm"> </span></div>'),St=O('<div class="filter-options-dropdown svelte-1uy8f65"><div class="filter-options-section svelte-1uy8f65"><div class="filter-options-grid svelte-1uy8f65"></div> <!> <!></div></div>'),Mt=O('<div class="filter-dropdown svelte-1uy8f65"><button><!> <span class="filter-label svelte-1uy8f65"> </span> <!></button> <!></div>');function Me(i,e){ve(e,!0);let a=he(e,"selectedOptions",19,()=>[]),r=K(!1),c;function u(n){const w=n.target,p=document.querySelector(".filter-options-dropdown");p&&p.contains(w)||c&&!c.contains(w)&&M(r,!1)}U(()=>{if(t(r))return document.addEventListener("click",u),()=>{document.removeEventListener("click",u)}});function v(n){e.type==="platforms"?L.togglePlatform(n):e.type==="genres"?L.toggleGenre(n):e.type==="tiers"&&L.toggleTier(n)}function b(){a().forEach(n=>{e.type==="platforms"?L.removePlatform(n):e.type==="genres"?L.removeGenre(n):e.type==="tiers"&&L.removeTier(n)})}function T(n){return e.type==="platforms"?mt(n):e.type==="genres"?ft(n):e.type==="tiers"?gt(n):"bg-gray-600 text-white"}function A(){return a().length===0?"bg-surface hover:bg-accent hover:text-accent-foreground border-0":"bg-accent text-accent-foreground border-0"}function F(n){n.key==="Escape"?(M(r,!1),n.preventDefault()):(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),M(r,!t(r)))}function N(){return{"aria-expanded":t(r),"aria-haspopup":"listbox","aria-label":`Filter by ${e.label.toLowerCase()}`}}var G=Mt(),C=o(G),R=()=>M(r,!t(r));Fe(C,(n,w,p)=>({type:"button",class:`filter-button ${n??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:R,onkeydown:F,...w,[Ne]:p}),[A,N,()=>({selected:a().length>0})],void 0,"svelte-1uy8f65");var j=o(C);{var Q=n=>{pt(n,{size:16,class:"text-gray-600 dark:text-gray-400"})},Y=n=>{var w=ce(),p=ue(w);{var s=E=>{_t(E,{size:16,class:"text-gray-600 dark:text-gray-400"})},f=E=>{var k=ce(),z=ue(k);{var P=y=>{yt(y,{size:16,class:"text-gray-600 dark:text-gray-400"})};B(z,y=>{e.type==="tiers"&&y(P)},!0)}h(E,k)};B(p,E=>{e.type==="genres"?E(s):E(f,!1)},!0)}h(n,w)};B(j,n=>{e.type==="platforms"?n(Q):n(Y,!1)})}var H=x(j,2),Z=o(H);l(H);var _=x(H,2);{var d=n=>{var w=xt(),p=o(w,!0);l(w),re(()=>oe(p,a().length)),h(n,w)};B(_,n=>{a().length>0&&n(d)})}l(C);var m=x(C,2);{var S=n=>{var w=St(),p=o(w),s=o(p);Ee(s,20,()=>e.options,P=>P,(P,y)=>{var V=kt();V.__click=[wt,v,y];var $=o(V,!0);l(V),re((ee,X,q)=>{_e(V,1,`filter-option-item ${ee??""} ${X??""}`,"svelte-1uy8f65"),oe($,q)},[()=>T(y),()=>a().includes(y)?"selected":"",()=>e.type==="tiers"?Oe(y):y]),h(P,V)}),l(s);var f=x(s,2);{var E=P=>{var y=Tt(),V=o(y);V.__click=[Lt,b],l(y),h(P,y)};B(f,P=>{a().length>0&&P(E)})}var k=x(f,2);{var z=P=>{var y=Pt(),V=o(y),$=o(V);l(V),l(y),re(ee=>oe($,`No ${ee??""} available`),[()=>e.label.toLowerCase()]),h(P,y)};B(k,P=>{e.options.length===0&&P(z)})}l(p),l(w),h(n,w)};B(m,n=>{t(r)&&n(S)})}l(G),Le(G,n=>c=n,()=>c),re(()=>oe(Z,`Filter by ${e.label??""}`)),h(i,G),me()}de(["click"]);function Rt(i,e,a){const r=i.target,c=parseInt(r.value);e(c,t(a),!0)}function Ct(i,e,a){const r=i.target,c=parseInt(r.value);e(t(a),c,!1)}var Et=O('<span class="filter-icon svelte-1ugjrx4" aria-label="Rating filter">🏆</span>'),Ot=(i,e)=>{i.stopPropagation(),e()},At=O('<button type="button" class="reset-button svelte-1ugjrx4" title="Reset to default range">Reset</button>'),Gt=(i,e)=>e(i,"min"),jt=(i,e)=>e(i,"max"),Vt=O('<div class="rating-slider svelte-1ugjrx4"><div class="slider-header svelte-1ugjrx4"><span class="slider-label svelte-1ugjrx4"><!> </span> <!></div> <div class="slider-container svelte-1ugjrx4"><div class="dual-slider-row svelte-1ugjrx4"><div class="slider-track svelte-1ugjrx4" role="application" aria-label="Rating range slider track"><div class="slider-fill svelte-1ugjrx4"><div class="drag-handle drag-handle-left svelte-1ugjrx4" role="button" tabindex="0"></div> <div class="drag-handle drag-handle-right svelte-1ugjrx4" role="button" tabindex="0"></div></div> <input type="range" class="slider-thumb slider-thumb-min svelte-1ugjrx4"/> <input type="range" class="slider-thumb slider-thumb-max svelte-1ugjrx4"/></div></div></div></div>');function Dt(i,e){ve(e,!0);let a=he(e,"step",3,1),r=he(e,"disabled",3,!1),c=he(e,"onRangeChange",3,()=>{});function u(){const g=e.label.toLowerCase();return g.includes("presentation")?Ye:g.includes("story")?Ze:g.includes("gameplay")?$e:null}function v(){const g=e.label.toLowerCase();return g.includes("presentation")?"text-cyan-500":g.includes("story")?"text-amber-600":g.includes("gameplay")?"text-pink-500":"text-gray-600"}let b=K(le(e.minValue)),T=K(le(e.maxValue)),A,F=K(!1),N=K(null);U(()=>{M(b,e.minValue,!0),M(T,e.maxValue,!0)});function G(g,D,te){return Math.min(Math.max(g,D),te)}function C(g,D,te=!1){if(r())return;let W=G(g,e.minLimit,e.maxLimit),I=G(D,e.minLimit,e.maxLimit);te?W=Math.min(W,I):I=Math.max(I,W),W=Math.round(W/a())*a(),I=Math.round(I/a())*a(),M(b,W,!0),M(T,I,!0),c()(W,I)}function R(){C(e.minLimit,e.maxLimit)}function j(g,D){r()||(M(N,D,!0),M(F,!0),document.addEventListener("mousemove",Y),document.addEventListener("mouseup",H),g.preventDefault())}function Q(g){if(r()||!A)return;const D=A.getBoundingClientRect(),te=g.clientX-D.left,W=D.width,I=te/W,se=Z()/100,ne=_()/100,Te=se,Pe=ne;if(I>=Te&&I<=Pe){const Se=Math.abs(I-se),ze=Math.abs(I-ne);M(N,Se<=ze?"min":"max",!0),M(F,!0),document.addEventListener("mousemove",Y),document.addEventListener("mouseup",H),g.preventDefault()}}function Y(g){if(!t(F)||!A||r())return;const D=A.getBoundingClientRect(),te=g.clientX-D.left,W=D.width,I=Math.max(0,Math.min(1,te/W)),se=Math.round((I*(e.maxLimit-e.minLimit)+e.minLimit)/a())*a(),ne=G(se,e.minLimit,e.maxLimit);t(N)==="min"?C(ne,t(T),!0):t(N)==="max"&&C(t(b),ne,!1)}function H(){M(F,!1),M(N,null),document.removeEventListener("mousemove",Y),document.removeEventListener("mouseup",H)}function Z(){return(t(b)-e.minLimit)/(e.maxLimit-e.minLimit)*100}function _(){return(t(T)-e.minLimit)/(e.maxLimit-e.minLimit)*100}function d(){return t(b)===e.minLimit&&t(T)===e.maxLimit}function m(){return"#6b7280"}var S=Vt(),n=o(S),w=o(n),p=o(w);{var s=g=>{const D=fe(u);var te=ce(),W=ue(te);{let I=fe(v);Ve(W,()=>t(D),(se,ne)=>{ne(se,{get class(){return`filter-icon ${t(I)??""}`},get"aria-label"(){return`${e.label??""} filter`},size:20})})}h(g,te)},f=g=>{var D=Et();h(g,D)};B(p,g=>{u()?g(s):g(f,!1)})}var E=x(p);l(w);var k=x(w,2);{var z=g=>{var D=At();D.__click=[Ot,R],re(()=>D.disabled=r()),h(g,D)};B(k,g=>{d()||g(z)})}l(n);var P=x(n,2),y=o(P),V=o(y);V.__mousedown=Q;var $=o(V),ee=o($);ee.__mousedown=[Gt,j];var X=x(ee,2);X.__mousedown=[jt,j],l($);var q=x($,2);Ae(q),q.__input=[Rt,C,T];var ae=x(q,2);Ae(ae),ae.__input=[Ct,C,b],l(V),l(y),l(P),Le(P,g=>A=g,()=>A),l(S),re((g,D,te,W,I,se,ne,Te,Pe,Se)=>{pe(S,`--min-color: ${g??""}; --max-color: ${D??""}`),oe(E,` ${e.label??""}
			${t(b)??""} - ${t(T)??""}`),pe($,`left: ${te??""}%; width: ${W??""}%`),pe(ee,`background-color: ${I??""}`),J(ee,"aria-label",`Drag to adjust minimum ${se??""} value`),pe(X,`background-color: ${ne??""}`),J(X,"aria-label",`Drag to adjust maximum ${Te??""} value`),J(q,"min",e.minLimit),J(q,"max",e.maxLimit),J(q,"step",a()),Ge(q,t(b)),q.disabled=r(),J(q,"aria-label",`Minimum ${Pe??""} rating`),J(ae,"min",e.minLimit),J(ae,"max",e.maxLimit),J(ae,"step",a()),Ge(ae,t(T)),ae.disabled=r(),J(ae,"aria-label",`Maximum ${Se??""} rating`)},[m,m,Z,()=>_()-Z(),m,()=>e.label.toLowerCase(),m,()=>e.label.toLowerCase(),()=>e.label.toLowerCase(),()=>e.label.toLowerCase()]),h(i,S),me()}de(["click","mousedown","input"]);var Ft=O('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1vf89kc"> </span>'),Nt=O('<div class="rating-slider-item svelte-1vf89kc"><!></div>'),zt=(i,e)=>{i.stopPropagation(),e()},It=O('<div class="filter-actions mt-4 flex justify-center svelte-1vf89kc"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),Ut=O('<div class="ratings-filter-dropdown svelte-1vf89kc"><div class="filter-options-section svelte-1vf89kc"><div class="filter-options-grid svelte-1vf89kc"></div> <!></div></div>'),Bt=O('<div class="ratings-filter svelte-1vf89kc"><button><!> <span class="filter-label svelte-1vf89kc">Filter by Ratings</span> <!></button> <!></div>');function Ht(i,e){ve(e,!0);const a={presentation:{label:"Presentation",maxValue:10},story:{label:"Story",maxValue:10},gameplay:{label:"Gameplay",maxValue:10},total:{label:"Score",maxValue:20}};let r=K(!1),c,u=K(le({presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}));U(()=>L.ratingRanges.subscribe(d=>{M(u,d,!0)}));function v(_){const d=_.target,m=document.querySelector(".ratings-filter-dropdown");m&&m.contains(d)||c&&!c.contains(d)&&M(r,!1)}U(()=>{if(t(r))return document.addEventListener("click",v),()=>{document.removeEventListener("click",v)}});function b(){L.setRatingsRange([0,10])}function T(){return t(u).presentation[0]>0||t(u).presentation[1]<10||t(u).story[0]>0||t(u).story[1]<10||t(u).gameplay[0]>0||t(u).gameplay[1]<10||t(u).total[0]>0||t(u).total[1]<20}function A(){return T()?"bg-accent text-accent-foreground border-0":"bg-surface hover:bg-accent hover:text-accent-foreground border-0"}function F(_){_.key==="Escape"?(M(r,!1),_.preventDefault()):(_.key==="Enter"||_.key===" ")&&(_.preventDefault(),M(r,!t(r)))}function N(){return{"aria-expanded":t(r),"aria-haspopup":"listbox","aria-label":"Filter by ratings"}}var G=Bt(),C=o(G),R=()=>M(r,!t(r));Fe(C,(_,d,m)=>({type:"button",class:`filter-button ${_??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:R,onkeydown:F,...d,[Ne]:m}),[A,N,()=>({selected:T()})],void 0,"svelte-1vf89kc");var j=o(C);ht(j,{size:16,class:"text-gray-600 dark:text-gray-400"});var Q=x(j,4);{var Y=_=>{var d=Ft(),m=o(d,!0);l(d),re(S=>oe(m,S),[()=>[t(u).presentation,t(u).story,t(u).gameplay,t(u).total].filter(([S,n],w)=>{const p=[[0,10],[0,10],[0,10],[0,20]];return S>p[w][0]||n<p[w][1]}).length]),h(_,d)};B(Q,_=>{T()&&_(Y)})}l(C);var H=x(C,2);{var Z=_=>{var d=Ut(),m=o(d),S=o(m);Ee(S,21,()=>Object.entries(a),([p,s])=>p,(p,s)=>{var f=fe(()=>Ue(t(s),2));let E=()=>t(f)[0],k=()=>t(f)[1];const z=fe(E),P=fe(()=>t(u)[t(z)]);var y=Nt(),V=o(y);Dt(V,{get label(){return k().label},get minValue(){return t(P)[0]},get maxValue(){return t(P)[1]},step:1,minLimit:0,get maxLimit(){return k().maxValue},onRangeChange:($,ee)=>{const X={...t(u),[t(z)]:[$,ee]},q=(X.presentation[0]+X.story[0]+X.gameplay[0])/3,ae=(X.presentation[1]+X.story[1]+X.gameplay[1])/3;L.setRatingsRange([Math.round(q),Math.round(ae)])}}),l(y),h(p,y)}),l(S);var n=x(S,2);{var w=p=>{var s=It(),f=o(s);f.__click=[zt,b],l(s),h(p,s)};B(n,p=>{T()&&p(w)})}l(m),l(d),h(_,d)};B(H,_=>{t(r)&&_(Z)})}l(G),Le(G,_=>c=_,()=>c),h(i,G),me()}de(["click"]);var qt=O('<meta name="viewport" content="width=device-width, initial-scale=1.0"/>  <link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/> <link rel="dns-prefetch" href="//fonts.googleapis.com"/> <link rel="dns-prefetch" href="//fonts.gstatic.com"/>',1),Wt=O('<div class="flex flex-col items-center gap-4"><div class="flex flex-wrap items-center justify-center gap-3"><!> <!> <!> <!> <button class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors svelte-12qhfyh" title="Reset all filters">↻ Reset</button></div></div>'),Kt=O('<div class="bg-background text-foreground min-h-screen"><!> <section class="filter-section sticky top-[104px] z-30 md:top-[110px] svelte-12qhfyh"><div class="container mx-auto space-y-4 px-6 py-4"><!> <!></div></section> <main style="background-color: var(--color-background);" class="px-6 pt-0 pb-6"><div class="container mx-auto"><!></div></main> <!></div>');function ia(i,e){ve(e,!0);const a=()=>Ce(je,"$modalStore",r),[r,c]=De();let u=!1,v,b=K(null),T=K(le({platforms:[],genres:[],tiers:[]})),A=K("all");U(()=>Re.subscribe(f=>{M(T,bt(f),!0)})),U(()=>ie.activeTab.subscribe(f=>{M(A,f,!0),f==="tierlist"&&(L.resetAllFilters(),L.setSearchTerm(""),v&&clearTimeout(v),ie.writeToURLWithFilters(L))})),U(()=>{if(!u){const s=be.url.searchParams.get("game");s&&setTimeout(()=>{const f=Re.getGameBySlug(s);f&&je.openViewModal(f)},100),u=!0}}),U(()=>{a().isOpen&&!t(b)&&ge(()=>import("./ytuguJH7.js"),__vite__mapDeps([17,1,2,6,7,8,3,9,18,19,10,20]),import.meta.url).then(s=>{M(b,s.default,!0)}).catch(s=>{console.error("Failed to load DetailModal:",s)})});let F=null;L.subscribe(s=>{F=s}),U(()=>{u&&(v&&clearTimeout(v),v=setTimeout(()=>{ie.writeToURLWithFilters(L)},300))}),U(()=>{const s=be.url,f=s.searchParams.get("search")||"",E=s.searchParams.get("platforms")||"",k=s.searchParams.get("genres")||"",z=s.searchParams.get("tiers")||"",P=s.searchParams.get("ratingPresentation")||"",y=s.searchParams.get("ratingStory")||"",V=s.searchParams.get("ratingGameplay")||"",$=s.searchParams.get("ratingTotal")||"",ee={searchQuery:f,selectedPlatforms:E?E.split(","):[],selectedGenres:k?k.split(","):[],selectedTiers:z?z.split(","):[],ratingRanges:{presentation:P?P.split(",").map(Number):[0,10],story:y?y.split(",").map(Number):[0,10],gameplay:V?V.split(",").map(Number):[0,10],total:$?$.split(",").map(Number):[0,20]}},X=JSON.stringify(ee),q=JSON.stringify(F);u&&X!==q&&L.readFromURL(be.url.searchParams),L.readFromURL(be.url.searchParams)});let N=K(le([])),G=K(le([])),C=K(le([]));U(()=>{const s=L.selectedPlatforms.subscribe(k=>{M(N,k,!0)}),f=L.selectedGenres.subscribe(k=>{M(G,k,!0)}),E=L.selectedTiers.subscribe(k=>{M(C,k,!0)});return()=>{s(),f(),E()}});function R(){L.resetAllFilters(),L.setSearchTerm(""),ie.activeTab.set("all"),v&&clearTimeout(v),ie.writeToURLWithFilters(L),setTimeout(()=>{window.scrollTo({top:0,behavior:"smooth"}),requestAnimationFrame(()=>{window.scrollTo(0,0),document.documentElement.scrollTop=0})},200)}var j=Kt();Be(s=>{var f=qt();qe.title="Gaming Tracker",We(8),h(s,f)});var Q=o(j);ct(Q,{});var Y=x(Q,2),H=o(Y),Z=o(H);vt(Z,{});var _=x(Z,2);{var d=s=>{var f=Wt(),E=o(f),k=o(E);Me(k,{type:"platforms",label:"Platforms",get options(){return t(T).platforms},get selectedOptions(){return t(N)}});var z=x(k,2);Me(z,{type:"genres",label:"Genres",get options(){return t(T).genres},get selectedOptions(){return t(G)}});var P=x(z,2);Me(P,{type:"tiers",label:"Tiers",get options(){return t(T).tiers},get selectedOptions(){return t(C)}});var y=x(P,2);Ht(y,{});var V=x(y,2);V.__click=R,l(E),l(f),h(s,f)};B(_,s=>{t(A)!=="tierlist"&&s(d)})}l(H),l(Y);var m=x(Y,2),S=o(m),n=o(S);He(n,()=>e.children??Ke),l(S),l(m);var w=x(m,2);{var p=s=>{var f=ce(),E=ue(f);Ve(E,()=>t(b),(k,z)=>{z(k,{})}),h(s,f)};B(w,s=>{t(b)&&s(p)})}l(j),h(i,j),me(),c()}de(["click"]);export{yt as T,na as _,ia as a};
