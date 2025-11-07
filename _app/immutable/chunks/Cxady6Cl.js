const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./-OiUa4fY.js","./DsnmJJEf.js","./DoUP4Vb6.js","./7_uHGuRw.js","./EHyETUk-.js","./C3H6G9Ri.js","./Cdyf70MY.js","./Hb39hkmt.js","./C2zytS0B.js","./C4ExBT-z.js","./CuhwzhfH.js","../assets/GameCard.B135ZzL1.css","./r5FzVWqK.js","./CcIhRbQL.js","./D5amXUmK.js","./B6K266Eh.js","../assets/TierListView.CADzuQX_.css","./C-t8bzKu.js","./CP9ppwsE.js","./DMq3snBu.js","../assets/DetailModal.Cpb9Cm9V.css"])))=>i.map(i=>d[i]);
import{g as Re,e as Ee}from"./7_uHGuRw.js";import{_ as ge,c as Ve}from"./CJJal6Za.js";import"./DsnmJJEf.js";import{n as de,p as ve,o as W,v as le,w as q,x as P,f as A,t as re,b as h,c as me,d as o,s as k,g as l,i as t,j as fe,h as oe,ag as Ie,ae as ce,a as ue,af as Ue,z as Be,aV as He,$ as qe,A as We,P as Ke}from"./DoUP4Vb6.js";import{a as Ce,b as De,i as U,l as ye,s as xe,p as he}from"./Cdyf70MY.js";import{p as be}from"./B9saL304.js";import{d as Q,s as _e,g as Oe,e as Xe,f as Je,T as Qe,I as we,b as ke,h as Fe,C as Ne,r as Ae,c as pe,i as Ge,P as Ye,N as Ze,G as $e,m as je}from"./Hb39hkmt.js";import{a as se,f as L}from"./DMq3snBu.js";import{b as Le}from"./CP9ppwsE.js";import"./C2zytS0B.js";async function et(s){return Re.loadGames(s),{}}const na=Object.freeze(Object.defineProperty({__proto__:null,load:et},Symbol.toStringTag,{value:"Module"}));function tt(){se.toggleTheme()}var at=A('<button type="button" class="theme-toggle svelte-1cmi4dh"><div class="icon-container svelte-1cmi4dh"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></div></button>');function rt(s,e){ve(e,!0);let a=W(le(typeof document<"u"&&document.documentElement.classList.contains("light")?"light":"dark"));q(()=>se.theme.subscribe(N=>{P(a,N,!0)}));var r=at();r.__click=[tt];var c=o(r),u=o(c);let d;var _=k(u,2);let T;l(c),l(r),re((G,N)=>{Q(r,"aria-label",t(a)==="dark"?"Switch to light mode":"Switch to dark mode"),Q(r,"title",t(a)==="dark"?"Switch to light mode":"Switch to dark mode"),d=_e(u,0,"sun-icon svelte-1cmi4dh",null,d,G),T=_e(_,0,"moon-icon svelte-1cmi4dh",null,T,N)},[()=>({visible:t(a)==="light",hidden:t(a)==="dark"}),()=>({visible:t(a)==="dark",hidden:t(a)==="light"})]),h(s,r),me()}de(["click"]);var nt=(s,e,a)=>e(t(a)),it=(s,e,a)=>e(t(a).id),st=A('<span class="tab-count svelte-1elxaub"> </span>'),lt=A('<li class="tab-item svelte-1elxaub" role="presentation"><button type="button" role="tab"><span class="tab-label svelte-1elxaub"> </span> <!></button></li>'),ot=A('<header class="header svelte-1elxaub"><div class="header-background svelte-1elxaub"></div> <div class="header-content container mx-auto px-6 svelte-1elxaub"><div class="header-left svelte-1elxaub"><button class="logo svelte-1elxaub" aria-label="Go to homepage and reset all filters"><picture class="logo-image svelte-1elxaub"><source srcset="logo.webp" type="image/webp"/> <img src="logo.png" alt="Gaming Tracker Logo"/></picture></button></div> <div class="header-right"><!></div></div> <nav class="navigation-tabs svelte-1elxaub" aria-label="Game navigation"><div class="navigation-background svelte-1elxaub"></div> <div class="navigation-content svelte-1elxaub"><ul class="tabs-list svelte-1elxaub" role="tablist"></ul></div></nav></header>');function ct(s,e){ve(e,!0);const a=()=>Ce(d,"$activeTab",c),r=()=>Ce(T,"$filteredGamesStore",c),[c,u]=De(),{activeTab:d,theme:_}=se,T=L.createFilteredGamesStore();if(typeof window<"u"){const v=localStorage.getItem("gaming-tracker-active-tab"),g=window.location.hash.replace("#","");let n=v||"all";g==="completed"?n="completed":g==="planned"?n="planned":g==="tierlist"&&(n="tierlist"),n!==a()&&d.set(n)}const G=fe(()=>[{id:"all",label:"Games",route:"/",count:r().totalCount},{id:"completed",label:"Completed",route:"completed",count:r().completedCount},{id:"planned",label:"Planned",route:"planned",count:r().plannedCount},{id:"tierlist",label:"Tier List",route:"tierlist",count:null}]);function N(){L.resetAllFilters(),d.set("all"),typeof window<"u"&&window.location&&window.history.replaceState(null,"",window.location.pathname+window.location.search),typeof window<"u"&&window.scrollTo({top:0,behavior:"smooth"})}function z(v){if(v.id!==a()&&(d.set(v.id),typeof window<"u")){const g=v.id==="all"?"":`#${v.id}`;window.history.replaceState(null,"",`${window.location.pathname}${g}`)}}function V(v){v==="all"?ge(()=>import("./-OiUa4fY.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):v==="completed"?ge(()=>import("./r5FzVWqK.js"),__vite__mapDeps([12,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):v==="planned"?ge(()=>import("./CcIhRbQL.js"),__vite__mapDeps([13,1,2,3,4,5,6,7,8,9,10,11]),import.meta.url):v==="tierlist"&&ge(()=>import("./D5amXUmK.js"),__vite__mapDeps([14,1,2,6,3,7,8,9,4,10,5,11,15,16]),import.meta.url)}var R=ot(),S=k(o(R),2),E=o(S),$=o(E);$.__click=N,l(E);var K=k(E,2),X=o(K);rt(X,{}),l(K),l(S);var Y=k(S,2),y=k(o(Y),2),O=o(y);Ee(O,21,()=>t(G),v=>v.id,(v,g)=>{var n=lt(),m=o(n);let x;m.__click=[nt,z,g],m.__mouseover=[it,V,g];var i=o(m),f=o(i,!0);l(i);var C=k(i,2);{var M=j=>{var w=st(),p=o(w);l(w),re(()=>oe(p,`(${t(g).count??""})`)),h(j,w)};U(C,j=>{t(g).count!==null&&j(M)})}l(m),l(n),re(j=>{x=_e(m,1,"tab-button svelte-1elxaub",null,x,j),Q(m,"aria-selected",a()===t(g).id),Q(m,"tabindex",a()===t(g).id?0:-1),oe(f,t(g).label)},[()=>({active:a()===t(g).id})]),Ie("focus",m,()=>V(t(g).id)),h(v,n)}),l(O),l(y),l(Y),l(R),h(s,R),me(),u()}de(["click","mouseover"]);var ut=A('<button type="button" class="clear-button svelte-yyldap" aria-label="Clear search"><span aria-hidden="true">×</span></button>'),dt=A('<div class="search-bar-container svelte-yyldap"><div class="search-bar svelte-yyldap"><span class="search-icon svelte-yyldap" aria-hidden="true">🔍</span> <input type="text" placeholder="Search games..." class="search-input svelte-yyldap" aria-label="Search games" autocomplete="off" spellcheck="false"/> <!></div></div>');function vt(s,e){ve(e,!0);let a,r,c=W("");q(()=>L.subscribe(E=>{E&&P(c,E.searchTerm,!0)})),q(()=>{a&&a.focus()});function u(S){const $=S.target.value;r&&clearTimeout(r),r=setTimeout(()=>{L.setSearchTerm($),L.writeToURL()},300)}function d(){a&&(a.value="",a.focus()),L.setSearchTerm(""),L.writeToURL(),r&&clearTimeout(r)}function _(S){S.key==="Escape"&&a&&a.select()}function T(S){S.key==="Escape"&&a&&(S.preventDefault(),a.focus(),a.select())}q(()=>(document.addEventListener("keydown",T),()=>{document.removeEventListener("keydown",T)}));var G=dt(),N=o(G),z=k(o(N),2);z.__input=u,z.__keydown=_,Le(z,S=>a=S,()=>a);var V=k(z,2);{var R=S=>{var E=ut();E.__click=d,h(S,E)};U(V,S=>{t(c)&&S(R)})}l(N),l(G),h(s,G),me()}de(["input","keydown","click"]);function mt(s){return Xe[s]||"bg-gray-600 text-white"}function ft(s){return Je[s]||"bg-gray-600 text-white"}function gt(s){const e=Oe(s);return Qe[e]||"bg-gray-600 text-white"}function bt(s){const e=new Set,a=new Set,r=new Set;return s.forEach(c=>{c.platform&&e.add(c.platform),c.genre&&a.add(c.genre),c.tier&&r.add(Oe(c.tier))}),{platforms:Array.from(e).sort(),genres:Array.from(a).sort(),tiers:Array.from(r).sort()}}function pt(s,e){const a=ye(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];we(s,xe({name:"monitor"},()=>a,{get iconNode(){return r},children:(c,u)=>{var d=ce(),_=ue(d);ke(_,e,"default",{}),h(c,d)},$$slots:{default:!0}}))}function ht(s,e){const a=ye(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]];we(s,xe({name:"star"},()=>a,{get iconNode(){return r},children:(c,u)=>{var d=ce(),_=ue(d);ke(_,e,"default",{}),h(c,d)},$$slots:{default:!0}}))}function _t(s,e){const a=ye(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor"}]];we(s,xe({name:"tag"},()=>a,{get iconNode(){return r},children:(c,u)=>{var d=ce(),_=ue(d);ke(_,e,"default",{}),h(c,d)},$$slots:{default:!0}}))}function yt(s,e){const a=ye(e,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18"}],["path",{d:"M4 22h16"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6"}]];we(s,xe({name:"trophy"},()=>a,{get iconNode(){return r},children:(c,u)=>{var d=ce(),_=ue(d);ke(_,e,"default",{}),h(c,d)},$$slots:{default:!0}}))}var xt=A('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1uy8f65"> </span>'),wt=(s,e,a)=>e(a),kt=A('<button type="button"> </button>'),Lt=(s,e)=>{s.stopPropagation(),e()},Tt=A('<div class="filter-actions mt-3 flex justify-center svelte-1uy8f65"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),Pt=A('<div class="empty-state py-2 text-center svelte-1uy8f65"><span class="text-muted-foreground text-sm"> </span></div>'),St=A('<div class="filter-options-dropdown svelte-1uy8f65"><div class="filter-options-section svelte-1uy8f65"><div class="filter-options-grid svelte-1uy8f65"></div> <!> <!></div></div>'),Mt=A('<div class="filter-dropdown svelte-1uy8f65"><button><!> <span class="filter-label svelte-1uy8f65"> </span> <!></button> <!></div>');function Me(s,e){ve(e,!0);let a=he(e,"selectedOptions",19,()=>[]),r=W(!1),c;function u(n){const m=n.target,x=document.querySelector(".filter-options-dropdown");x&&x.contains(m)||c&&!c.contains(m)&&P(r,!1)}q(()=>{if(t(r))return document.addEventListener("click",u),()=>{document.removeEventListener("click",u)}});function d(n){e.type==="platforms"?L.togglePlatform(n):e.type==="genres"?L.toggleGenre(n):e.type==="tiers"&&L.toggleTier(n)}function _(){a().forEach(n=>{e.type==="platforms"?L.removePlatform(n):e.type==="genres"?L.removeGenre(n):e.type==="tiers"&&L.removeTier(n)})}function T(n){return e.type==="platforms"?mt(n):e.type==="genres"?ft(n):e.type==="tiers"?gt(n):"bg-gray-600 text-white"}function G(){return a().length===0?"bg-surface hover:bg-accent hover:text-accent-foreground border-0":"bg-accent text-accent-foreground border-0"}function N(n){n.key==="Escape"?(P(r,!1),n.preventDefault()):(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),P(r,!t(r)))}function z(){return{"aria-expanded":t(r),"aria-haspopup":"listbox","aria-label":`Filter by ${e.label.toLowerCase()}`}}var V=Mt(),R=o(V),S=()=>P(r,!t(r));Fe(R,(n,m,x)=>({type:"button",class:`filter-button ${n??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:S,onkeydown:N,...m,[Ne]:x}),[G,z,()=>({selected:a().length>0})],void 0,"svelte-1uy8f65");var E=o(R);{var $=n=>{pt(n,{size:16,class:"text-gray-600 dark:text-gray-400"})},K=n=>{var m=ce(),x=ue(m);{var i=C=>{_t(C,{size:16,class:"text-gray-600 dark:text-gray-400"})},f=C=>{var M=ce(),j=ue(M);{var w=p=>{yt(p,{size:16,class:"text-gray-600 dark:text-gray-400"})};U(j,p=>{e.type==="tiers"&&p(w)},!0)}h(C,M)};U(x,C=>{e.type==="genres"?C(i):C(f,!1)},!0)}h(n,m)};U(E,n=>{e.type==="platforms"?n($):n(K,!1)})}var X=k(E,2),Y=o(X);l(X);var y=k(X,2);{var O=n=>{var m=xt(),x=o(m,!0);l(m),re(()=>oe(x,a().length)),h(n,m)};U(y,n=>{a().length>0&&n(O)})}l(R);var v=k(R,2);{var g=n=>{var m=St(),x=o(m),i=o(x);Ee(i,20,()=>e.options,w=>w,(w,p)=>{var D=kt();D.__click=[wt,d,p];var Z=o(D,!0);l(D),re((ee,J,B)=>{_e(D,1,`filter-option-item ${ee??""} ${J??""}`,"svelte-1uy8f65"),oe(Z,B)},[()=>T(p),()=>a().includes(p)?"selected":"",()=>e.type==="tiers"?Oe(p):p]),h(w,D)}),l(i);var f=k(i,2);{var C=w=>{var p=Tt(),D=o(p);D.__click=[Lt,_],l(p),h(w,p)};U(f,w=>{a().length>0&&w(C)})}var M=k(f,2);{var j=w=>{var p=Pt(),D=o(p),Z=o(D);l(D),l(p),re(ee=>oe(Z,`No ${ee??""} available`),[()=>e.label.toLowerCase()]),h(w,p)};U(M,w=>{e.options.length===0&&w(j)})}l(x),l(m),h(n,m)};U(v,n=>{t(r)&&n(g)})}l(V),Le(V,n=>c=n,()=>c),re(()=>oe(Y,`Filter by ${e.label??""}`)),h(s,V),me()}de(["click"]);function Rt(s,e,a){const r=s.target,c=parseInt(r.value);e(c,t(a),!0)}function Ct(s,e,a){const r=s.target,c=parseInt(r.value);e(t(a),c,!1)}var Et=A('<span class="filter-icon svelte-1ugjrx4" aria-label="Rating filter">🏆</span>'),Ot=(s,e)=>{s.stopPropagation(),e()},At=A('<button type="button" class="reset-button svelte-1ugjrx4" title="Reset to default range">Reset</button>'),Gt=(s,e)=>e(s,"min"),jt=(s,e)=>e(s,"max"),Vt=A('<div class="rating-slider svelte-1ugjrx4"><div class="slider-header svelte-1ugjrx4"><span class="slider-label svelte-1ugjrx4"><!> </span> <!></div> <div class="slider-container svelte-1ugjrx4"><div class="dual-slider-row svelte-1ugjrx4"><div class="slider-track svelte-1ugjrx4" role="application" aria-label="Rating range slider track"><div class="slider-fill svelte-1ugjrx4"><div class="drag-handle drag-handle-left svelte-1ugjrx4" role="button" tabindex="0"></div> <div class="drag-handle drag-handle-right svelte-1ugjrx4" role="button" tabindex="0"></div></div> <input type="range" class="slider-thumb slider-thumb-min svelte-1ugjrx4"/> <input type="range" class="slider-thumb slider-thumb-max svelte-1ugjrx4"/></div></div></div></div>');function Dt(s,e){ve(e,!0);let a=he(e,"step",3,1),r=he(e,"disabled",3,!1),c=he(e,"onRangeChange",3,()=>{});function u(){const b=e.label.toLowerCase();return b.includes("presentation")?Ye:b.includes("story")?Ze:b.includes("gameplay")?$e:null}function d(){const b=e.label.toLowerCase();return b.includes("presentation")?"text-cyan-500":b.includes("story")?"text-amber-600":b.includes("gameplay")?"text-pink-500":"text-gray-600"}let _=W(le(e.minValue)),T=W(le(e.maxValue)),G,N=W(!1),z=W(null);q(()=>{P(_,e.minValue,!0),P(T,e.maxValue,!0)});function V(b,F,te){return Math.min(Math.max(b,F),te)}function R(b,F,te=!1){if(r())return;let H=V(b,e.minLimit,e.maxLimit),I=V(F,e.minLimit,e.maxLimit);te?H=Math.min(H,I):I=Math.max(I,H),H=Math.round(H/a())*a(),I=Math.round(I/a())*a(),P(_,H,!0),P(T,I,!0),c()(H,I)}function S(){R(e.minLimit,e.maxLimit)}function E(b,F){r()||(P(z,F,!0),P(N,!0),document.addEventListener("mousemove",K),document.addEventListener("mouseup",X),b.preventDefault())}function $(b){if(r()||!G)return;const F=G.getBoundingClientRect(),te=b.clientX-F.left,H=F.width,I=te/H,ie=Y()/100,ne=y()/100,Te=ie,Pe=ne;if(I>=Te&&I<=Pe){const Se=Math.abs(I-ie),ze=Math.abs(I-ne);P(z,Se<=ze?"min":"max",!0),P(N,!0),document.addEventListener("mousemove",K),document.addEventListener("mouseup",X),b.preventDefault()}}function K(b){if(!t(N)||!G||r())return;const F=G.getBoundingClientRect(),te=b.clientX-F.left,H=F.width,I=Math.max(0,Math.min(1,te/H)),ie=Math.round((I*(e.maxLimit-e.minLimit)+e.minLimit)/a())*a(),ne=V(ie,e.minLimit,e.maxLimit);t(z)==="min"?R(ne,t(T),!0):t(z)==="max"&&R(t(_),ne,!1)}function X(){P(N,!1),P(z,null),document.removeEventListener("mousemove",K),document.removeEventListener("mouseup",X)}function Y(){return(t(_)-e.minLimit)/(e.maxLimit-e.minLimit)*100}function y(){return(t(T)-e.minLimit)/(e.maxLimit-e.minLimit)*100}function O(){return t(_)===e.minLimit&&t(T)===e.maxLimit}function v(){return"#6b7280"}var g=Vt(),n=o(g),m=o(n),x=o(m);{var i=b=>{const F=fe(u);var te=ce(),H=ue(te);{let I=fe(d);Ve(H,()=>t(F),(ie,ne)=>{ne(ie,{get class(){return`filter-icon ${t(I)??""}`},get"aria-label"(){return`${e.label??""} filter`},size:20})})}h(b,te)},f=b=>{var F=Et();h(b,F)};U(x,b=>{u()?b(i):b(f,!1)})}var C=k(x);l(m);var M=k(m,2);{var j=b=>{var F=At();F.__click=[Ot,S],re(()=>F.disabled=r()),h(b,F)};U(M,b=>{O()||b(j)})}l(n);var w=k(n,2),p=o(w),D=o(p);D.__mousedown=$;var Z=o(D),ee=o(Z);ee.__mousedown=[Gt,E];var J=k(ee,2);J.__mousedown=[jt,E],l(Z);var B=k(Z,2);Ae(B),B.__input=[Rt,R,T];var ae=k(B,2);Ae(ae),ae.__input=[Ct,R,_],l(D),l(p),l(w),Le(w,b=>G=b,()=>G),l(g),re((b,F,te,H,I,ie,ne,Te,Pe,Se)=>{pe(g,`--min-color: ${b??""}; --max-color: ${F??""}`),oe(C,` ${e.label??""}
			${t(_)??""} - ${t(T)??""}`),pe(Z,`left: ${te??""}%; width: ${H??""}%`),pe(ee,`background-color: ${I??""}`),Q(ee,"aria-label",`Drag to adjust minimum ${ie??""} value`),pe(J,`background-color: ${ne??""}`),Q(J,"aria-label",`Drag to adjust maximum ${Te??""} value`),Q(B,"min",e.minLimit),Q(B,"max",e.maxLimit),Q(B,"step",a()),Ge(B,t(_)),B.disabled=r(),Q(B,"aria-label",`Minimum ${Pe??""} rating`),Q(ae,"min",e.minLimit),Q(ae,"max",e.maxLimit),Q(ae,"step",a()),Ge(ae,t(T)),ae.disabled=r(),Q(ae,"aria-label",`Maximum ${Se??""} rating`)},[v,v,Y,()=>y()-Y(),v,()=>e.label.toLowerCase(),v,()=>e.label.toLowerCase(),()=>e.label.toLowerCase(),()=>e.label.toLowerCase()]),h(s,g),me()}de(["click","mousedown","input"]);var Ft=A('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1vf89kc"> </span>'),Nt=A('<div class="rating-slider-item svelte-1vf89kc"><!></div>'),zt=(s,e)=>{s.stopPropagation(),e()},It=A('<div class="filter-actions mt-4 flex justify-center svelte-1vf89kc"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),Ut=A('<div class="ratings-filter-dropdown svelte-1vf89kc"><div class="filter-options-section svelte-1vf89kc"><div class="filter-options-grid svelte-1vf89kc"></div> <!></div></div>'),Bt=A('<div class="ratings-filter svelte-1vf89kc"><button><!> <span class="filter-label svelte-1vf89kc">Filter by Ratings</span> <!></button> <!></div>');function Ht(s,e){ve(e,!0);const a={presentation:{label:"Presentation",maxValue:10},story:{label:"Story",maxValue:10},gameplay:{label:"Gameplay",maxValue:10},total:{label:"Score",maxValue:20}};let r=W(!1),c,u=W(le({presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}));q(()=>L.ratingRanges.subscribe(O=>{P(u,O,!0)}));function d(y){const O=y.target,v=document.querySelector(".ratings-filter-dropdown");v&&v.contains(O)||c&&!c.contains(O)&&P(r,!1)}q(()=>{if(t(r))return document.addEventListener("click",d),()=>{document.removeEventListener("click",d)}});function _(){L.setRatingsRange([0,10])}function T(){return t(u).presentation[0]>0||t(u).presentation[1]<10||t(u).story[0]>0||t(u).story[1]<10||t(u).gameplay[0]>0||t(u).gameplay[1]<10||t(u).total[0]>0||t(u).total[1]<20}function G(){return T()?"bg-accent text-accent-foreground border-0":"bg-surface hover:bg-accent hover:text-accent-foreground border-0"}function N(y){y.key==="Escape"?(P(r,!1),y.preventDefault()):(y.key==="Enter"||y.key===" ")&&(y.preventDefault(),P(r,!t(r)))}function z(){return{"aria-expanded":t(r),"aria-haspopup":"listbox","aria-label":"Filter by ratings"}}var V=Bt(),R=o(V),S=()=>P(r,!t(r));Fe(R,(y,O,v)=>({type:"button",class:`filter-button ${y??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:S,onkeydown:N,...O,[Ne]:v}),[G,z,()=>({selected:T()})],void 0,"svelte-1vf89kc");var E=o(R);ht(E,{size:16,class:"text-gray-600 dark:text-gray-400"});var $=k(E,4);{var K=y=>{var O=Ft(),v=o(O,!0);l(O),re(g=>oe(v,g),[()=>[t(u).presentation,t(u).story,t(u).gameplay,t(u).total].filter(([g,n],m)=>{const x=[[0,10],[0,10],[0,10],[0,20]];return g>x[m][0]||n<x[m][1]}).length]),h(y,O)};U($,y=>{T()&&y(K)})}l(R);var X=k(R,2);{var Y=y=>{var O=Ut(),v=o(O),g=o(v);Ee(g,21,()=>Object.entries(a),([x,i])=>x,(x,i)=>{var f=fe(()=>Ue(t(i),2));let C=()=>t(f)[0],M=()=>t(f)[1];const j=fe(C),w=fe(()=>t(u)[t(j)]);var p=Nt(),D=o(p);Dt(D,{get label(){return M().label},get minValue(){return t(w)[0]},get maxValue(){return t(w)[1]},step:1,minLimit:0,get maxLimit(){return M().maxValue},onRangeChange:(Z,ee)=>{const J={...t(u),[t(j)]:[Z,ee]},B=(J.presentation[0]+J.story[0]+J.gameplay[0])/3,ae=(J.presentation[1]+J.story[1]+J.gameplay[1])/3;L.setRatingsRange([Math.round(B),Math.round(ae)])}}),l(p),h(x,p)}),l(g);var n=k(g,2);{var m=x=>{var i=It(),f=o(i);f.__click=[zt,_],l(i),h(x,i)};U(n,x=>{T()&&x(m)})}l(v),l(O),h(y,O)};U(X,y=>{t(r)&&y(Y)})}l(V),Le(V,y=>c=y,()=>c),h(s,V),me()}de(["click"]);var qt=A('<meta name="viewport" content="width=device-width, initial-scale=1.0"/>  <link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/> <link rel="dns-prefetch" href="//fonts.googleapis.com"/> <link rel="dns-prefetch" href="//fonts.gstatic.com"/>',1),Wt=A('<div class="flex flex-col items-center gap-4"><div class="flex flex-wrap items-center justify-center gap-3"><!> <!> <!> <!> <button class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors svelte-12qhfyh" title="Reset all filters">↻ Reset</button></div></div>'),Kt=A('<div class="bg-background text-foreground min-h-screen"><!> <section class="filter-section sticky top-[104px] z-30 md:top-[110px] svelte-12qhfyh"><div class="container mx-auto space-y-4 px-6 py-4"><!> <!></div></section> <main style="background-color: var(--color-background);" class="px-6 pt-0 pb-6"><div class="container mx-auto"><!></div></main> <!></div>');function ia(s,e){ve(e,!0);const a=()=>Ce(je,"$modalStore",r),[r,c]=De();let u=!1,d,_=W(null),T=W(le({platforms:[],genres:[],tiers:[]})),G=W("all");q(()=>Re.subscribe(f=>{P(T,bt(f),!0)})),q(()=>se.activeTab.subscribe(f=>{P(G,f,!0),f==="tierlist"&&(L.resetAllFilters(),L.setSearchTerm(""),d&&clearTimeout(d),se.writeToURLWithFilters(L))})),q(()=>{if(!u){const i=be.url.searchParams.get("game");i&&setTimeout(()=>{const f=Re.getGameBySlug(i);f&&je.openViewModal(f)},100),u=!0}}),q(()=>{a().isOpen&&!t(_)&&ge(()=>import("./C-t8bzKu.js"),__vite__mapDeps([17,1,2,6,7,8,3,9,18,19,10,20]),import.meta.url).then(i=>{P(_,i.default,!0)}).catch(i=>{console.error("Failed to load DetailModal:",i)})});let N=null;L.subscribe(i=>{N=i}),q(()=>{u&&(d&&clearTimeout(d),d=setTimeout(()=>{se.writeToURLWithFilters(L)},300))}),q(()=>{const i=be.url,f=i.searchParams.get("search")||"",C=i.searchParams.get("platforms")||"",M=i.searchParams.get("genres")||"",j=i.searchParams.get("tiers")||"",w=i.searchParams.get("ratingPresentation")||"",p=i.searchParams.get("ratingStory")||"",D=i.searchParams.get("ratingGameplay")||"",Z=i.searchParams.get("ratingTotal")||"",ee={searchQuery:f,selectedPlatforms:C?C.split(","):[],selectedGenres:M?M.split(","):[],selectedTiers:j?j.split(","):[],ratingRanges:{presentation:w?w.split(",").map(Number):[0,10],story:p?p.split(",").map(Number):[0,10],gameplay:D?D.split(",").map(Number):[0,10],total:Z?Z.split(",").map(Number):[0,20]}},J=JSON.stringify(ee),B=JSON.stringify(N);u&&J!==B&&L.readFromURL(be.url.searchParams),L.readFromURL(be.url.searchParams)});let z=W(le([])),V=W(le([])),R=W(le([]));q(()=>{const i=L.selectedPlatforms.subscribe(M=>{P(z,M,!0)}),f=L.selectedGenres.subscribe(M=>{P(V,M,!0)}),C=L.selectedTiers.subscribe(M=>{P(R,M,!0)});return()=>{i(),f(),C()}});function S(){L.resetAllFilters(),L.setSearchTerm(""),se.activeTab.set("all"),d&&clearTimeout(d),se.writeToURLWithFilters(L),setTimeout(()=>{window.scrollTo({top:0,behavior:"smooth"}),requestAnimationFrame(()=>{window.scrollTo(0,0),document.documentElement.scrollTop=0})},200)}var E=Kt();Be(i=>{var f=qt();qe.title="Gaming Tracker",We(8),h(i,f)});var $=o(E);ct($,{});var K=k($,2),X=o(K),Y=o(X);vt(Y,{});var y=k(Y,2);{var O=i=>{var f=Wt(),C=o(f),M=o(C);Me(M,{type:"platforms",label:"Platforms",get options(){return t(T).platforms},get selectedOptions(){return t(z)}});var j=k(M,2);Me(j,{type:"genres",label:"Genres",get options(){return t(T).genres},get selectedOptions(){return t(V)}});var w=k(j,2);Me(w,{type:"tiers",label:"Tiers",get options(){return t(T).tiers},get selectedOptions(){return t(R)}});var p=k(w,2);Ht(p,{});var D=k(p,2);D.__click=S,l(C),l(f),h(i,f)};U(y,i=>{t(G)!=="tierlist"&&i(O)})}l(X),l(K);var v=k(K,2),g=o(v),n=o(g);He(n,()=>e.children??Ke),l(g),l(v);var m=k(v,2);{var x=i=>{var f=ce(),C=ue(f);Ve(C,()=>t(_),(M,j)=>{j(M,{})}),h(i,f)};U(m,i=>{t(_)&&i(x)})}l(E),h(s,E),me(),c()}de(["click"]);export{yt as T,na as _,ia as a};
