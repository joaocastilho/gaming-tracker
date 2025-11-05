import{g as Ce,f as ut,h as mt,T as gt,l as ft,C as Ot,d as te,j as Ae,e as Je,r as Ye,n as Ft,b as ge,c as J,o as lt,I as fe,s as pe,a as ie,P as ot,N as ct,G as dt}from"../chunks/BN3_tthn.js";import"../chunks/DsnmJJEf.js";import{i as de,p as oe,l as B,m as N,f as T,s as n,b as p,c as ce,j as Y,d as i,n as t,g as r,t as K,h as j,k as se,a6 as we,w as re,ah as jt,a5 as ve,a as le,o as At,ai as Et,v as Dt,aj as Bt,$ as Vt,ak as It}from"../chunks/n759wMWL.js";import{i as D,p as je,l as be,s as ye}from"../chunks/l5podWyg.js";import{p as Se}from"../chunks/BQjvg7tG.js";import{b as Ee}from"../chunks/gtQZzKR0.js";import{f as S,a as ae}from"../chunks/qo4590QC.js";import"../chunks/CxIAlbqE.js";async function Ut(l){return await Ce.loadGames(l),{}}const dr=Object.freeze(Object.defineProperty({__proto__:null,load:Ut},Symbol.toStringTag,{value:"Module"}));var Ht=T('<button type="button" class="clear-button svelte-yyldap" aria-label="Clear search"><span aria-hidden="true">×</span></button>'),Qt=T('<div class="search-bar-container svelte-yyldap"><div class="search-bar svelte-yyldap"><span class="search-icon svelte-yyldap" aria-hidden="true">🔍</span> <input type="text" placeholder="Search games..." class="search-input svelte-yyldap" aria-label="Search games" autocomplete="off" spellcheck="false"/> <!></div></div>');function Kt(l,a){oe(a,!0);let e,s,o=Y("");B(()=>S.searchQuery.subscribe(C=>{N(o,C,!0)})),B(()=>{e&&e.focus()});function d(G){const V=G.target.value;s&&clearTimeout(s),s=setTimeout(()=>{S.searchQuery.set(V),S.writeToURL()},300)}function v(){e&&(e.value="",e.focus()),S.searchQuery.set(""),S.writeToURL(),s&&clearTimeout(s)}function w(G){G.key==="Escape"&&e&&e.select()}var z=Qt(),x=i(z),u=n(i(x),2);u.__input=d,u.__keydown=w,Ee(u,G=>e=G,()=>e);var X=n(u,2);{var $=G=>{var C=Ht();C.__click=v,p(G,C)};D(X,G=>{t(o)&&G($)})}r(x),r(z),p(l,z),ce()}de(["input","keydown","click"]);const Yt=l=>ut[l]||"bg-[#6b7280] text-[#f9fafb]",Jt=l=>mt[l]||"bg-[#6b7280] text-[#f9fafb]",Wt=l=>gt[l]||"bg-gray-600 text-white",qt=l=>{const a=new Set;return l.forEach(e=>{e.platform&&a.add(e.platform)}),Array.from(a).sort()},Xt=l=>{const a=new Set;return l.forEach(e=>{e.genre&&a.add(e.genre)}),Array.from(a).sort()},Zt=l=>{const a=new Set;l.forEach(o=>{o.status==="Completed"&&o.tier&&a.add(o.tier)});const e={S:"S - Masterpiece",A:"A - Amazing",B:"B - Great",C:"C - Good",D:"D - Decent",E:"E - Bad"};return Array.from(a).map(o=>e[o]).filter(Boolean).sort((o,d)=>{const v=["S - Masterpiece","A - Amazing","B - Great","C - Good","D - Decent","E - Bad"];return v.indexOf(o)-v.indexOf(d)})},ea=l=>({platforms:qt(l),genres:Xt(l),tiers:Zt(l)});function ta(l,a,e,s){a().forEach(o=>{e.type==="platforms"?S.removePlatform(o):e.type==="genres"?S.removeGenre(o):e.type==="tiers"&&S.removeTier(o)}),N(s,!1)}var aa=T('<button type="button" class="text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button>'),ra=(l,a,e)=>a(e),ia=T('<label class="option-item hover:bg-accent hover:text-accent-foreground flex items-center gap-3 px-3 py-2 transition-colors svelte-1uy8f65"><input type="checkbox" class="option-checkbox border-border h-4 w-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-0 svelte-1uy8f65"/> <span> </span></label>'),sa=T('<div class="empty-state px-3 py-4 text-center svelte-1uy8f65"><span class="text-muted-foreground text-sm"> </span></div>'),na=T('<div class="dropdown-panel rounded-md border shadow-lg svelte-1uy8f65"><div class="dropdown-header border-border border-b px-3 py-2 svelte-1uy8f65"><div class="flex items-center justify-between"><span class="text-foreground text-sm font-medium"> </span> <!></div></div> <div class="dropdown-options max-h-60 overflow-y-auto py-1 svelte-1uy8f65"><!> <!></div></div>'),la=T('<div class="filter-dropdown svelte-1uy8f65"><button> <span aria-hidden="true">▼</span></button> <!></div>');function Ke(l,a){oe(a,!0);let e=je(a,"selectedOptions",19,()=>[]),s=Y(!1),o;function d(m){o&&!o.contains(m.target)&&N(s,!1)}B(()=>{if(t(s))return document.addEventListener("click",d),()=>{document.removeEventListener("click",d)}});function v(m){a.type==="platforms"?S.togglePlatform(m):a.type==="genres"?S.toggleGenre(m):a.type==="tiers"&&S.toggleTier(m)}function w(){if(e().length===0)return`All ${a.label}`;if(e().length===1){const m=e()[0];return a.type==="tiers"?Ae(m):m}else return`${e().length} ${a.label}`}function z(m){return a.type==="platforms"?Yt(m):a.type==="genres"?Jt(m):a.type==="tiers"?Wt(m):"bg-gray-600 text-white"}function x(){return e().length===0?"bg-surface hover:bg-accent hover:text-accent-foreground":"bg-accent text-accent-foreground"}function u(m){m.key==="Escape"?(N(s,!1),m.preventDefault()):(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),N(s,!t(s)))}function X(){return{"aria-expanded":t(s),"aria-haspopup":"listbox","aria-label":`Filter by ${a.label.toLowerCase()}`}}var $=la(),G=i($),C=()=>N(s,!t(s));ft(G,(m,b,h)=>({type:"button",class:`filter-button ${m??""} flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs font-medium transition-colors`,onclick:C,onkeydown:u,...b,[Ot]:h}),[x,X,()=>({selected:e().length>0})],void 0,"svelte-1uy8f65");var V=i(G),Z=n(V);let ee;r(G);var c=n(G,2);{var L=m=>{var b=na(),h=i(b),O=i(h),g=i(O),M=i(g);r(g);var H=n(g,2);{var A=_=>{var k=aa();k.__click=[ta,e,a,s],p(_,k)};D(H,_=>{e().length>0&&_(A)})}r(O),r(h);var W=n(h,2),P=i(W);Je(P,16,()=>a.options,_=>_,(_,k)=>{var Q=ia(),I=i(Q);Ye(I),I.__change=[ra,v,k];var U=n(I,2),ue=i(U,!0);r(U),r(Q),K((ke,Ge,Le)=>{Ft(I,ke),te(U,1,`option-badge ${Ge??""} rounded px-2 py-1 text-xs font-medium`,"svelte-1uy8f65"),j(ue,Le)},[()=>e().includes(k),()=>z(k),()=>a.type==="tiers"?Ae(k):k]),p(_,Q)});var R=n(P,2);{var E=_=>{var k=sa(),Q=i(k),I=i(Q);r(Q),r(k),K(U=>j(I,`No ${U??""} available`),[()=>a.label.toLowerCase()]),p(_,k)};D(R,_=>{a.options.length===0&&_(E)})}r(W),r(b),K(_=>j(M,`Filter by ${_??""}`),[()=>a.label.toLowerCase()]),p(m,b)};D(c,m=>{t(s)&&m(L)})}r($),Ee($,m=>o=m,()=>o),K((m,b)=>{j(V,`${m??""} `),ee=te(Z,1,"dropdown-arrow svelte-1uy8f65",null,ee,b)},[w,()=>({rotated:t(s)})]),p(l,$),ce()}de(["click","change"]);function oa(l,a,e){const s=l.target,o=parseInt(s.value);a(o,t(e),!0)}function ca(l,a,e){const s=l.target,o=parseInt(s.value);a(t(e),o,!1)}function da(l,a,e){a(e.minLimit,e.maxLimit)}var va=T('<button type="button" class="reset-button svelte-1ugjrx4" title="Reset to default range">Reset</button>'),ua=T('<div class="rating-slider svelte-1ugjrx4"><div class="slider-header svelte-1ugjrx4"><span class="slider-label svelte-1ugjrx4"> </span> <!></div> <div class="slider-container svelte-1ugjrx4"><div class="slider-track svelte-1ugjrx4"><div class="slider-fill svelte-1ugjrx4"></div></div> <input type="range" class="slider-thumb slider-thumb-min svelte-1ugjrx4"/> <input type="range" class="slider-thumb slider-thumb-max svelte-1ugjrx4"/></div> <div class="slider-values svelte-1ugjrx4"><span class="value-display min-value svelte-1ugjrx4"> </span> <span class="range-indicator svelte-1ugjrx4">–</span> <span class="value-display max-value svelte-1ugjrx4"> </span></div></div>');function ma(l,a){oe(a,!0);let e=je(a,"step",3,1),s=je(a,"disabled",3,!1),o=je(a,"onRangeChange",3,()=>{}),d=Y(se(a.minValue)),v=Y(se(a.maxValue));B(()=>{N(d,a.minValue,!0),N(v,a.maxValue,!0)});function w(P,R,E){return Math.min(Math.max(P,R),E)}function z(P,R,E=!1){if(s())return;let _=w(P,a.minLimit,a.maxLimit),k=w(R,a.minLimit,a.maxLimit);E?_=Math.min(_,k):k=Math.max(k,_),_=Math.round(_/e())*e(),k=Math.round(k/e())*e(),N(d,_,!0),N(v,k,!0),o()(_,k)}function x(){return(t(d)-a.minLimit)/(a.maxLimit-a.minLimit)*100}function u(){return(t(v)-a.minLimit)/(a.maxLimit-a.minLimit)*100}function X(){return t(d)===a.minLimit&&t(v)===a.maxLimit}function $(){return{min:t(d),max:t(v)}}var G=ua(),C=i(G),V=i(C),Z=i(V,!0);r(V);var ee=n(V,2);{var c=P=>{var R=va();R.__click=[da,z,a],K(()=>R.disabled=s()),p(P,R)};D(ee,P=>{X()||P(c)})}r(C);var L=n(C,2),m=i(L),b=i(m);r(m);var h=n(m,2);Ye(h),h.__input=[oa,z,v];var O=n(h,2);Ye(O),O.__input=[ca,z,d],r(L);var g=n(L,2),M=i(g),H=i(M,!0);r(M);var A=n(M,4),W=i(A,!0);r(A),r(g),r(G),K((P,R,E,_,k,Q,I,U,ue,ke)=>{j(Z,a.label),ge(L,`--min-percent: ${P??""}%; --max-percent: ${R??""}%`),ge(b,`left: ${E??""}%; width: ${_??""}%`),J(h,"min",a.minLimit),J(h,"max",a.maxLimit),J(h,"step",e()),lt(h,t(d)),h.disabled=s(),J(h,"aria-label",`Minimum ${k??""} rating`),ge(h,`left: ${Q??""}%`),J(O,"min",a.minLimit),J(O,"max",a.maxLimit),J(O,"step",e()),lt(O,t(v)),O.disabled=s(),J(O,"aria-label",`Maximum ${I??""} rating`),ge(O,`left: ${U??""}%`),j(H,ue),j(W,ke)},[x,u,x,()=>u()-x(),()=>a.label.toLowerCase(),x,()=>a.label.toLowerCase(),u,()=>$().min,()=>$().max]),p(l,G),ce()}de(["click","input"]);function ga(){S.setRatingRange("presentation",0,10),S.setRatingRange("story",0,10),S.setRatingRange("gameplay",0,10),S.setRatingRange("total",0,20)}var fa=T('<button type="button" class="text-xs" style="color: #3b82f6;">Reset all</button>'),pa=T(`<div class="dropdown-panel bg-background border-border rounded-md border shadow-lg svelte-1vf89kc"><div class="dropdown-header border-border border-b px-3 py-2 svelte-1vf89kc"><div class="flex items-center justify-between"><span class="text-sm font-medium" style="color: var(--color-text-primary);">Filter by ratings</span> <!></div></div> <div class="ratings-container p-3 svelte-1vf89kc"><div class="sliders-grid svelte-1vf89kc"></div> <div class="help-text border-border mt-4 border-t pt-3 svelte-1vf89kc"><p class="text-xs" style="color: var(--color-text-secondary);">💡 Filter games by presentation, story, gameplay, and total scores. Only completed games
						with ratings are included.</p></div></div></div>`),ba=T('<div class="ratings-filter svelte-1vf89kc"><button> <span aria-hidden="true">▼</span></button> <!></div>');function ya(l,a){oe(a,!0);const e={presentation:{label:"Presentation",minLimit:0,maxLimit:10,step:1,ariaLabel:"Presentation rating"},story:{label:"Story",minLimit:0,maxLimit:10,step:1,ariaLabel:"Story rating"},gameplay:{label:"Gameplay",minLimit:0,maxLimit:10,step:1,ariaLabel:"Gameplay rating"},total:{label:"Total Score",minLimit:0,maxLimit:20,step:1,ariaLabel:"Total score"}};let s=Y(!1),o,d=Y(se({presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}));B(()=>S.ratingRanges.subscribe(h=>{JSON.stringify(h)!==JSON.stringify(t(d))&&N(d,h,!0)}));function v(b){o&&!o.contains(b.target)&&N(s,!1)}B(()=>{if(t(s))return document.addEventListener("click",v),()=>{document.removeEventListener("click",v)}});function w(b,h,O){S.setRatingRange(b,h,O)}function z(){return t(d).presentation[0]>0||t(d).presentation[1]<10||t(d).story[0]>0||t(d).story[1]<10||t(d).gameplay[0]>0||t(d).gameplay[1]<10||t(d).total[0]>0||t(d).total[1]<20}function x(){const b=[t(d).presentation,t(d).story,t(d).gameplay,t(d).total].filter(([h,O])=>{const g=e.presentation;return h>g.minLimit||O<g.maxLimit}).length;return b===0?"📊 All Ratings":b===1?"📊 Rating Filter":`📊 ${b} Rating Filters`}function u(){return z()?"bg-accent text-accent-foreground":"bg-surface hover:bg-accent hover:text-accent-foreground"}function X(b){b.key==="Escape"?(N(s,!1),b.preventDefault()):(b.key==="Enter"||b.key===" ")&&(b.preventDefault(),N(s,!t(s)))}function $(){return{"aria-expanded":t(s),"aria-haspopup":"listbox","aria-label":"Filter by ratings"}}var G=ba(),C=i(G),V=()=>N(s,!t(s));ft(C,(b,h)=>({type:"button",class:`filter-button ${b??""} flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs font-medium transition-colors`,onclick:V,onkeydown:X,...h}),[u,$],void 0,"svelte-1vf89kc");var Z=i(C),ee=n(Z);let c;r(C);var L=n(C,2);{var m=b=>{var h=pa(),O=i(h),g=i(O),M=n(i(g),2);{var H=P=>{var R=fa();R.__click=[ga],p(P,R)};D(M,P=>{z()&&P(H)})}r(g),r(O);var A=n(O,2),W=i(A);Je(W,21,()=>Object.entries(e),([P,R])=>P,(P,R)=>{var E=we(()=>jt(t(R),2));let _=()=>t(E)[0],k=()=>t(E)[1];const Q=we(_),I=we(()=>t(d)[t(Q)]);ma(P,{get label(){return k().label},get minValue(){return t(I)[0]},get maxValue(){return t(I)[1]},get step(){return k().step},get minLimit(){return k().minLimit},get maxLimit(){return k().maxLimit},onRangeChange:(U,ue)=>w(t(Q),U,ue)})}),r(W),re(2),r(A),r(h),p(b,h)};D(L,b=>{t(s)&&b(m)})}r(G),Ee(G,b=>o=b,()=>o),K((b,h)=>{j(Z,`${b??""} `),c=te(ee,1,"dropdown-arrow svelte-1vf89kc",null,c,h)},[x,()=>({rotated:t(s)})]),p(l,G),ce()}de(["click"]);function ha(l,a){const e=be(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"m15 18-6-6 6-6"}]];fe(l,ye({name:"chevron-left"},()=>e,{get iconNode(){return s},children:(o,d)=>{var v=ve(),w=le(v);pe(w,a,"default",{}),p(o,v)},$$slots:{default:!0}}))}function xa(l,a){const e=be(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"m9 18 6-6-6-6"}]];fe(l,ye({name:"chevron-right"},()=>e,{get iconNode(){return s},children:(o,d)=>{var v=ve(),w=le(v);pe(w,a,"default",{}),p(o,v)},$$slots:{default:!0}}))}function _a(l,a){const e=be(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2"}],["path",{d:"M3 9h18"}],["path",{d:"M3 15h18"}],["path",{d:"M9 3v18"}],["path",{d:"M15 3v18"}]];fe(l,ye({name:"grid-3x3"},()=>e,{get iconNode(){return s},children:(o,d)=>{var v=ve(),w=le(v);pe(w,a,"default",{}),p(o,v)},$$slots:{default:!0}}))}function wa(l,a){const e=be(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"M3 5h.01"}],["path",{d:"M3 12h.01"}],["path",{d:"M3 19h.01"}],["path",{d:"M8 5h13"}],["path",{d:"M8 12h13"}],["path",{d:"M8 19h13"}]];fe(l,ye({name:"list"},()=>e,{get iconNode(){return s},children:(o,d)=>{var v=ve(),w=le(v);pe(w,a,"default",{}),p(o,v)},$$slots:{default:!0}}))}function ka(l,a){const e=be(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["circle",{cx:"18",cy:"5",r:"3"}],["circle",{cx:"6",cy:"12",r:"3"}],["circle",{cx:"18",cy:"19",r:"3"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49"}]];fe(l,ye({name:"share-2"},()=>e,{get iconNode(){return s},children:(o,d)=>{var v=ve(),w=le(v);pe(w,a,"default",{}),p(o,v)},$$slots:{default:!0}}))}function vt(l,a){const e=be(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18"}],["path",{d:"M4 22h16"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6"}]];fe(l,ye({name:"trophy"},()=>e,{get iconNode(){return s},children:(o,d)=>{var v=ve(),w=le(v);pe(w,a,"default",{}),p(o,v)},$$slots:{default:!0}}))}function Ga(l,a){const e=be(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]];fe(l,ye({name:"x"},()=>e,{get iconNode(){return s},children:(o,d)=>{var v=ve(),w=le(v);pe(w,a,"default",{}),p(o,v)},$$slots:{default:!0}}))}function La(l,a){l.target===t(a)&&ie.closeModal()}function Ta(l){(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),ie.closeModal())}async function Pa(l,a){if(t(a).activeGame)try{const e=new URL(window.location.href),s=t(a).activeGame.title.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim().replace(/^-|-$/g,"");e.searchParams.set("game",s),await navigator.clipboard.writeText(e.toString())}catch(e){console.warn("Failed to copy to clipboard:",e)}}var Ma=T('<button class="absolute top-1/2 left-2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70" aria-label="Previous game"><!></button>'),Sa=T('<button class="absolute top-1/2 right-2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70" aria-label="Next game"><!></button>'),Ca=()=>ie.closeModal(),Ra=T('<div class="absolute top-4 right-4 rounded-md bg-blue-600 px-3 py-1 text-sm font-semibold text-white">👥 Co-op</div>'),Na=T('<br/> <span class="font-semibold" style="font-size: 1.2rem; line-height: 1.2; color: var(--color-text-secondary);"> </span>',1),$a=T('<span class="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white">Co-op</span>'),za=T("<span> </span>"),Oa=T('<div><div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Hours Played</div> <div class="font-semibold" style="color: var(--color-text-primary);"> </div></div>'),Fa=T('<div><div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Time to Beat</div> <div class="font-semibold" style="color: var(--color-text-primary);"> </div></div>'),ja=T('<div class="mt-6 rounded-lg border border-blue-200 from-blue-50 to-purple-50 p-4 dark:border-blue-800 dark:from-blue-900/80 dark:to-purple-900/80"><div class="flex items-center justify-center gap-2"><!> <span class="text-lg font-bold" style="color: var(--color-text-primary);"> </span></div></div>'),Aa=T('<div class="space-y-4"><h3 class="mb-4 text-xl font-semibold" style="color: var(--color-text-primary);">Ratings</h3> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Presentation</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);"> </span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div></div></div></div> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Story</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);"> </span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div></div></div></div> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Gameplay</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);"> </span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div></div></div></div> <!></div>'),Ea=T('<div class="space-y-4"><h3 class="mb-4 text-xl font-semibold" style="color: var(--color-text-primary);">Ratings</h3> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Presentation</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">Not rated</span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300" style="width: 0%"></div></div></div> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Story</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">Not rated</span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300" style="width: 0%"></div></div></div> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Gameplay</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">Not rated</span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300" style="width: 0%"></div></div></div> <div class="mt-6 rounded-lg border border-gray-200 from-gray-50 to-gray-50 p-4 dark:border-gray-700"><div class="flex items-center justify-center gap-2"><!> <span class="text-lg font-bold" style="color: var(--color-text-primary);">Game to be completed</span></div></div></div>'),Da=T('<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-1 backdrop-blur-[8px]" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="modal-title"><!> <!> <button class="absolute top-4 right-16 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-gray-300 shadow-lg transition-all hover:scale-110 hover:bg-white dark:bg-gray-800/90 dark:border-gray-600 dark:hover:bg-gray-700" aria-label="Share game"><!></button> <button class="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600" aria-label="Close modal"><!></button> <div class="relative h-[600px] w-full max-w-4xl rounded-xl shadow-2xl" style="background-color: var(--color-surface);"><div class="grid grid-cols-1 gap-0 lg:grid-cols-[400px_1fr]"><div class="relative overflow-hidden rounded-l-lg"><img class="h-full w-full object-cover" style="width: 400px; height: 600px;" loading="lazy"/> <!></div> <div class="max-h-[60vh] overflow-y-auto pt-4 pr-6 pb-6 pl-6 lg:pt-6 lg:pr-8 lg:pb-8 lg:pl-8"><h1 id="modal-title" class="flex flex-col justify-center text-3xl font-bold" style="height: 65px; margin-bottom: 15px; color: var(--color-text-primary);"> <!></h1> <div class="mb-6 flex items-center justify-between"><div class="flex flex-wrap gap-2"><span> </span> <span> </span> <!></div> <!></div> <div class="mb-8 grid grid-cols-2 gap-4"><div><div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Year Released</div> <div class="font-semibold" style="color: var(--color-text-primary);"> </div></div> <!> <div><div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Finished Date</div> <div class="font-semibold" style="color: var(--color-text-primary);"> </div></div> <div><div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Co-op</div> <div class="font-semibold" style="color: var(--color-text-primary);"> </div></div></div> <!></div></div></div></div>');function Ba(l,a){oe(a,!0);let e=Y(se(ie.getState())),s=Y(se([]));B(()=>ie.subscribe(L=>{N(e,L,!0),ie.writeToURL()})),B(()=>Ce.subscribe(L=>{N(s,L,!0)}));let o=Y(void 0),d=we(()=>()=>{if(!t(e).activeGame?.title)return{mainTitle:"",subtitle:null};const c=t(e).activeGame.title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);return c?{mainTitle:c[1].trim(),subtitle:`(${c[2]})`}:{mainTitle:t(e).activeGame.title,subtitle:null}}),v=we(()=>()=>t(e).activeGame?t(s).findIndex(c=>c.id===t(e).activeGame?.id):-1);function w(){const c=t(v)();if(c>0){const L=t(s)[c-1];ie.openViewModal(L)}}function z(){const c=t(v)();if(c<t(s).length-1){const L=t(s)[c+1];ie.openViewModal(L)}}function x(c){c.key==="Escape"?ie.closeModal():c.key==="ArrowLeft"?(c.preventDefault(),w()):c.key==="ArrowRight"&&(c.preventDefault(),z())}function u(c){if(!c)return"Not completed";try{return new Date(c).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}catch{return"Invalid date"}}function X(c){if(!c)return"bg-gray-400";const L=Ae(c);return gt[L]||"bg-gray-400"}function $(c){return ut[c]||"bg-gray-600 text-white"}function G(c){return mt[c]||"bg-gray-600 text-white"}function C(c){return c>=8?"bg-gradient-to-r from-[#388E3C] to-[#4CAF50]":c>=6?"bg-gradient-to-r from-[#A4D454] to-[#8BC34A]":c>=5?"bg-gradient-to-r from-[#FFC107] to-[#FFEB3B]":c>=3?"bg-gradient-to-r from-[#FF832B] to-[#FF9800]":"bg-gradient-to-r from-[#D32F2F] to-[#F44336]"}At(()=>{document.addEventListener("keydown",x)}),Et(()=>{document.removeEventListener("keydown",x)});var V=ve(),Z=le(V);{var ee=c=>{var L=Da();L.__click=[La,o],L.__keydown=[Ta];var m=i(L);{var b=f=>{var y=Ma();y.__click=w;var F=i(y);ha(F,{size:32}),r(y),p(f,y)};D(m,f=>{t(v)()>0&&f(b)})}var h=n(m,2);{var O=f=>{var y=Sa();y.__click=z;var F=i(y);xa(F,{size:32}),r(y),p(f,y)};D(h,f=>{t(v)()<t(s).length-1&&f(O)})}var g=n(h,2);g.__click=[Pa,e];var M=i(g);ka(M,{size:18,class:"text-gray-700 dark:text-gray-200"}),r(g);var H=n(g,2);H.__click=[Ca];var A=i(H);Ga(A,{size:20,class:"text-gray-600 dark:text-gray-300"}),r(H);var W=n(H,2),P=i(W),R=i(P),E=i(R),_=n(E,2);{var k=f=>{var y=Ra();p(f,y)};D(_,f=>{t(e).activeGame.coOp==="Yes"&&f(k)})}r(R);var Q=n(R,2),I=i(Q),U=i(I),ue=n(U);{var ke=f=>{var y=Na(),F=n(le(y),2),q=i(F,!0);r(F),K(ne=>j(q,ne),[()=>t(d)().subtitle]),p(f,y)};D(ue,f=>{t(d)().subtitle&&f(ke)})}r(I);var Ge=n(I,2),Le=i(Ge),Re=i(Le),pt=i(Re,!0);r(Re);var Ne=n(Re,2),bt=i(Ne,!0);r(Ne);var yt=n(Ne,2);{var ht=f=>{var y=$a();p(f,y)};D(yt,f=>{t(e).activeGame.coOp==="Yes"&&f(ht)})}r(Le);var xt=n(Le,2);{var _t=f=>{var y=za(),F=i(y,!0);r(y),K((q,ne)=>{te(y,1,`rounded-md px-3 py-1 text-sm font-semibold text-white ${q??""}`),j(F,ne)},[()=>X(t(e).activeGame.tier),()=>Ae(t(e).activeGame.tier)]),p(f,y)};D(xt,f=>{t(e).activeGame.tier&&f(_t)})}r(Ge);var De=n(Ge,2),Be=i(De),We=n(i(Be),2),wt=i(We,!0);r(We),r(Be);var qe=n(Be,2);{var kt=f=>{var y=Oa(),F=n(i(y),2),q=i(F,!0);r(F),r(y),K(()=>j(q,t(e).activeGame.hoursPlayed||"Not completed")),p(f,y)},Gt=f=>{var y=Fa(),F=n(i(y),2),q=i(F,!0);r(F),r(y),K(()=>j(q,t(e).activeGame.timeToBeat)),p(f,y)};D(qe,f=>{t(e).activeGame.status==="Completed"?f(kt):f(Gt,!1)})}var Ve=n(qe,2),Xe=n(i(Ve),2),Lt=i(Xe,!0);r(Xe),r(Ve);var Ze=n(Ve,2),et=n(i(Ze),2),Tt=i(et,!0);r(et),r(Ze),r(De);var Pt=n(De,2);{var Mt=f=>{var y=Aa(),F=n(i(y),2),q=i(F),ne=i(q);ot(ne,{size:20,class:"flex-shrink-0 text-cyan-500"}),re(2),r(q);var me=n(q,2),$e=i(me);r(me);var ze=n(me,2),he=i(ze);r(ze),r(F);var xe=n(F,2),Te=i(xe),Oe=i(Te);ct(Oe,{size:20,class:"flex-shrink-0 text-amber-600"}),re(2),r(Te);var _e=n(Te,2),Ie=i(_e);r(_e);var tt=n(_e,2),at=i(tt);r(tt),r(xe);var Ue=n(xe,2),He=i(Ue),Ct=i(He);dt(Ct,{size:20,class:"flex-shrink-0 text-pink-500"}),re(2),r(He);var Qe=n(He,2),Rt=i(Qe);r(Qe);var rt=n(Qe,2),it=i(rt);r(rt),r(Ue);var Nt=n(Ue,2);{var $t=Pe=>{var Me=ja(),Fe=i(Me),st=i(Fe);vt(st,{size:24,class:"text-yellow-500"});var nt=n(st,2),zt=i(nt);r(nt),r(Fe),r(Me),K(()=>j(zt,`Total Score: ${t(e).activeGame.score??""}/20`)),p(Pe,Me)};D(Nt,Pe=>{t(e).activeGame.score!==null&&Pe($t)})}r(y),K((Pe,Me,Fe)=>{j($e,`${t(e).activeGame.ratingPresentation??""}/10`),te(he,1,`h-2 rounded-full ${Pe??""} transition-all duration-300`),ge(he,`width: ${t(e).activeGame.ratingPresentation*10}%`),j(Ie,`${t(e).activeGame.ratingStory??""}/10`),te(at,1,`h-2 rounded-full ${Me??""} transition-all duration-300`),ge(at,`width: ${t(e).activeGame.ratingStory*10}%`),j(Rt,`${t(e).activeGame.ratingGameplay??""}/10`),te(it,1,`h-2 rounded-full ${Fe??""} transition-all duration-300`),ge(it,`width: ${t(e).activeGame.ratingGameplay*10}%`)},[()=>C(t(e).activeGame.ratingPresentation),()=>C(t(e).activeGame.ratingStory),()=>C(t(e).activeGame.ratingGameplay)]),p(f,y)},St=f=>{var y=Ea(),F=n(i(y),2),q=i(F),ne=i(q);ot(ne,{size:20,class:"flex-shrink-0 text-cyan-500"}),re(2),r(q),re(4),r(F);var me=n(F,2),$e=i(me),ze=i($e);ct(ze,{size:20,class:"flex-shrink-0 text-amber-600"}),re(2),r($e),re(4),r(me);var he=n(me,2),xe=i(he),Te=i(xe);dt(Te,{size:20,class:"flex-shrink-0 text-pink-500"}),re(2),r(xe),re(4),r(he);var Oe=n(he,2),_e=i(Oe),Ie=i(_e);vt(Ie,{size:24,class:"text-gray-400"}),re(2),r(_e),r(Oe),r(y),p(f,y)};D(Pt,f=>{t(e).activeGame.status==="Completed"&&t(e).activeGame.ratingPresentation!==null&&t(e).activeGame.ratingStory!==null&&t(e).activeGame.ratingGameplay!==null?f(Mt):f(St,!1)})}r(Q),r(P),r(W),r(L),Ee(L,f=>N(o,f),()=>t(o)),K((f,y,F,q,ne)=>{J(E,"src",f),J(E,"alt",`${t(e).activeGame.title??""} cover`),j(U,`${y??""} `),te(Re,1,`rounded-md px-3 py-1 text-sm font-medium text-white ${F??""}`),j(pt,t(e).activeGame.platform),te(Ne,1,`rounded-md px-3 py-1 text-sm font-medium text-white ${q??""}`),j(bt,t(e).activeGame.genre),j(wt,t(e).activeGame.year),j(Lt,ne),j(Tt,t(e).activeGame.coOp==="Yes"?"Yes":"No")},[()=>t(e).activeGame.coverImage.replace(".webp","-detail.webp"),()=>t(d)().mainTitle,()=>$(t(e).activeGame.platform),()=>G(t(e).activeGame.genre),()=>u(t(e).activeGame.finishedDate)]),p(c,L)};D(Z,c=>{t(e).isOpen&&t(e).activeGame&&t(e).mode==="view"&&c(ee)})}p(l,V),ce()}de(["click","keydown"]);function Va(){ae.toggleTheme()}var Ia=T('<button type="button" class="theme-toggle svelte-1cmi4dh"><div class="icon-container svelte-1cmi4dh"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></div></button>');function Ua(l,a){oe(a,!0);let e=Y("dark");B(()=>ae.theme.subscribe(u=>{N(e,u,!0)}));var s=Ia();s.__click=[Va];var o=i(s),d=i(o);let v;var w=n(d,2);let z;r(o),r(s),K((x,u)=>{J(s,"aria-label",t(e)==="dark"?"Switch to light mode":"Switch to dark mode"),J(s,"title",t(e)==="dark"?"Switch to light mode":"Switch to dark mode"),v=te(d,0,"sun-icon svelte-1cmi4dh",null,v,x),z=te(w,0,"moon-icon svelte-1cmi4dh",null,z,u)},[()=>({visible:t(e)==="light",hidden:t(e)==="dark"}),()=>({visible:t(e)==="dark",hidden:t(e)==="light"})]),p(l,s),ce()}de(["click"]);var Ha=T('<header class="header svelte-1elxaub"><div class="header-left svelte-1elxaub"><div class="logo svelte-1elxaub"><picture class="logo-image svelte-1elxaub"><source srcset="logo.webp" type="image/webp"/> <img src="logo.png" alt="Gaming Tracker Logo"/></picture></div></div> <div class="header-right"><!></div></header>');function Qa(l,a){oe(a,!0),B(()=>ae.theme.subscribe(()=>{}));var e=Ha(),s=n(i(e),2),o=i(s);Ua(o,{}),r(s),r(e),p(l,e),ce()}var Ka=(l,a,e)=>a(t(e)),Ya=T('<span class="tab-count svelte-12wudpi"> </span>'),Ja=T('<li class="tab-item svelte-12wudpi" role="presentation"><button type="button" role="tab" aria-controls="main-content"><span class="tab-label svelte-12wudpi"> </span> <!></button></li>'),Wa=T('<nav class="navigation-tabs svelte-12wudpi" aria-label="Game navigation"><ul class="tabs-list svelte-12wudpi" role="tablist"></ul></nav>');function qa(l,a){oe(a,!0);let e=Y("all"),s=Y(se({total:0,planned:0,completed:0}));const o=S.createFilteredGamesStore(Ce);B(()=>ae.activeTab.subscribe(u=>{N(e,u,!0)})),B(()=>o.subscribe(u=>{N(s,{total:u.totalCount,planned:u.plannedCount,completed:u.completedCount},!0)})),B(()=>{if(typeof window<"u"){const x=window.location.hash.replace("#","");let u="all";x==="completed"?u="completed":x==="planned"?u="planned":x==="tierlist"?u="tierlist":u="all",u!==t(e)&&ae.activeTab.set(u)}});const d=we(()=>[{id:"all",label:"Games",route:"/",count:t(s).total},{id:"completed",label:"Completed",route:"completed",count:t(s).completed},{id:"planned",label:"Planned",route:"planned",count:t(s).planned},{id:"tierlist",label:"Tier List",route:"tierlist",count:null}]);function v(x){if(x.id!==t(e)&&(ae.activeTab.set(x.id),typeof window<"u"&&window.location)){const u=x.id==="all"?"":`#${x.id}`;window.history.replaceState(null,"",`${window.location.pathname}${window.location.search}${u}`)}}var w=Wa(),z=i(w);Je(z,21,()=>t(d),x=>x.id,(x,u)=>{var X=Ja(),$=i(X);let G;$.__click=[Ka,v,u];var C=i($),V=i(C,!0);r(C);var Z=n(C,2);{var ee=c=>{var L=Ya(),m=i(L);r(L),K(()=>{J(L,"aria-label",`(${t(u).count??""} games)`),j(m,`(${t(u).count??""})`)}),p(c,L)};D(Z,c=>{t(u).count!==null&&c(ee)})}r($),r(X),K(c=>{G=te($,1,"tab-button svelte-12wudpi",null,G,c),J($,"aria-selected",t(e)===t(u).id),J($,"tabindex",t(e)===t(u).id?0:-1),J($,"title",`Navigate to ${t(u).label??""} games`),j(V,t(u).label)},[()=>({active:t(e)===t(u).id})]),p(x,X)}),r(z),r(w),p(l,w),ce()}de(["click"]);function Xa(){ae.toggleViewMode()}var Za=T('<meta name="viewport" content="width=device-width, initial-scale=1.0"/>'),er=T('<div class="flex flex-nowrap items-center gap-3 overflow-x-auto pb-2 md:flex-wrap md:overflow-x-visible md:pb-0"><!> <!> <!> <!> <button class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors svelte-12qhfyh" title="Reset all filters">↻ Reset</button> <div class="ml-auto flex items-center"><button class="view-toggle-button flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"><!></button></div></div>'),tr=T('<div class="bg-background text-foreground min-h-screen"><!> <!> <section class="filter-section sticky top-[104px] z-30 md:top-[110px] svelte-12qhfyh"><div class="container mx-auto space-y-4 px-6 py-4"><!> <!></div></section> <main style="background-color: var(--color-background);" class="px-6 pt-0 pb-6"><div class="container mx-auto"><!></div></main> <!></div>');function vr(l,a){oe(a,!0);let e=!1,s,o=Y(se({platforms:[],genres:[],tiers:[]})),d=Y("gallery"),v=Y("all");B(()=>Ce.subscribe(M=>{N(o,ea(M),!0)})),B(()=>ae.viewMode.subscribe(M=>{N(d,M,!0)})),B(()=>ae.activeTab.subscribe(M=>{N(v,M,!0)})),B(()=>{if(!e){ae.readFromURLWithFilters(Se.url.searchParams,S);const g=Se.url.searchParams.get("game");g&&setTimeout(()=>{const M=Ce.getGameById(g);M&&ie.openViewModal(M)},100),e=!0}});let w={searchQuery:"",selectedPlatforms:[],selectedGenres:[],selectedTiers:[],ratingRanges:{presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}};S.filterState.subscribe(g=>{w=g}),B(()=>{e&&(s&&clearTimeout(s),s=setTimeout(()=>{ae.writeToURLWithFilters(S)},300))}),B(()=>{const g=Se.url,M=g.searchParams.get("search")||"",H=g.searchParams.get("platforms")||"",A=g.searchParams.get("genres")||"",W=g.searchParams.get("tiers")||"",P=g.searchParams.get("ratingPresentation")||"",R=g.searchParams.get("ratingStory")||"",E=g.searchParams.get("ratingGameplay")||"",_=g.searchParams.get("ratingTotal")||"",k={searchQuery:M,selectedPlatforms:H?H.split(","):[],selectedGenres:A?A.split(","):[],selectedTiers:W?W.split(","):[],ratingRanges:{presentation:P?P.split(",").map(Number):[0,10],story:R?R.split(",").map(Number):[0,10],gameplay:E?E.split(",").map(Number):[0,10],total:_?_.split(",").map(Number):[0,20]}},Q=JSON.stringify(k),I=JSON.stringify(w);e&&Q!==I&&S.readFromURL(Se.url.searchParams),S.readFromURL(Se.url.searchParams)});let z=Y(se([])),x=Y(se([])),u=Y(se([]));B(()=>{const g=S.selectedPlatforms.subscribe(A=>{N(z,A,!0)}),M=S.selectedGenres.subscribe(A=>{N(x,A,!0)}),H=S.selectedTiers.subscribe(A=>{N(u,A,!0)});return()=>{g(),M(),H()}});function X(){S.resetAllFilters(),s&&clearTimeout(s),ae.writeToURLWithFilters(S)}var $=tr();Dt(g=>{var M=Za();Vt.title="Gaming Tracker",p(g,M)});var G=i($);Qa(G,{});var C=n(G,2);qa(C,{});var V=n(C,2),Z=i(V),ee=i(Z);Kt(ee,{});var c=n(ee,2);{var L=g=>{var M=er(),H=i(M);Ke(H,{type:"platforms",label:"Platforms",get options(){return t(o).platforms},get selectedOptions(){return t(z)}});var A=n(H,2);Ke(A,{type:"genres",label:"Genres",get options(){return t(o).genres},get selectedOptions(){return t(x)}});var W=n(A,2);Ke(W,{type:"tiers",label:"Tiers",get options(){return t(o).tiers},get selectedOptions(){return t(u)}});var P=n(W,2);ya(P,{});var R=n(P,2);R.__click=X;var E=n(R,2),_=i(E);_.__click=[Xa];var k=i(_);{var Q=U=>{wa(U,{size:18,class:"text-gray-600 dark:text-gray-400"})},I=U=>{_a(U,{size:18,class:"text-gray-600 dark:text-gray-400"})};D(k,U=>{t(d)==="gallery"?U(Q):U(I,!1)})}r(_),r(E),r(M),K(()=>J(_,"title",t(d)==="gallery"?"Switch to table view":"Switch to gallery view")),p(g,M)};D(c,g=>{t(v)!=="tierlist"&&g(L)})}r(Z),r(V);var m=n(V,2),b=i(m),h=i(b);Bt(h,()=>a.children??It),r(b),r(m);var O=n(m,2);Ba(O,{}),r($),p(l,$),ce()}de(["click"]);export{vr as component,dr as universal};
