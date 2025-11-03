import{z as _,y as G,A as u,w as M,x as w,k as v}from"./DL2TtT-X.js";import{r as D}from"./DFuTqyHM.js";import"./DsnmJJEf.js";import"./Ck8nq1vg.js";import{I as R,s as C}from"./CCm8iIG9.js";import{l as z,s as A}from"./B53CFWSH.js";function k(c,i={}){const{maxSize:l=5,ttl:f=5e3}=i,o=new Map;return(h,d)=>{const m=h.map(n=>n.id).sort().join(","),a=JSON.stringify(d),e=`${m}|${a}`,t=o.get(e);if(t){if(Date.now()-t.timestamp<f)return t.value;o.delete(e)}const s=c(h,d);if(o.set(e,{value:s,timestamp:Date.now()}),o.size>l){const n=o.keys().next().value;n&&o.delete(n)}return s}}function K(c,i={}){const{maxSize:l=5,ttl:f=3e3}=i,o=new Map;return(h,d,m)=>{const e=`${h.map(n=>n.id).sort().join(",")}|${d}|${m}`,t=o.get(e);if(t){if(Date.now()-t.timestamp<f)return t.value;o.delete(e)}const s=c(h,d,m);if(o.set(e,{value:s,timestamp:Date.now()}),o.size>l){const n=o.keys().next().value;n&&o.delete(n)}return s}}function E(){const c=G(""),i=G([]),l=G([]),f=G([]),o=G({presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}),h=_([c,i,l,f,o],([a,e,t,s,n])=>({searchQuery:a,selectedPlatforms:e,selectedGenres:t,selectedTiers:s,ratingRanges:n})),d=k((a,e)=>a.filter(t=>{if(e.searchQuery.trim()){const s=e.searchQuery.toLowerCase().trim(),n=t.title.toLowerCase().includes(s),r=t.genre.toLowerCase().includes(s),P=t.platform.toLowerCase().includes(s);if(!n&&!r&&!P)return!1}if(e.selectedPlatforms.length>0&&!e.selectedPlatforms.includes(t.platform)||e.selectedGenres.length>0&&!e.selectedGenres.includes(t.genre))return!1;if(e.selectedTiers.length>0){if(t.status==="Completed"&&t.tier){if(!e.selectedTiers.includes(t.tier))return!1}else if(t.status!=="Completed")return!1}if(t.status==="Completed"&&t.ratingPresentation!==null&&t.ratingStory!==null&&t.ratingGameplay!==null){const[s,n]=e.ratingRanges.presentation,[r,P]=e.ratingRanges.story,[S,$]=e.ratingRanges.gameplay,[y,x]=e.ratingRanges.total;if(t.ratingPresentation<s||t.ratingPresentation>n||t.ratingStory<r||t.ratingStory>P||t.ratingGameplay<S||t.ratingGameplay>$)return!1;const b=Math.round((t.ratingPresentation+t.ratingStory+t.ratingGameplay)/3*2);if(b<y||b>x)return!1}return!0}));function m(a){return _([a,h],([e,t])=>{const s=d(e,t);return{filteredGames:s,totalCount:s.length,completedCount:s.filter(n=>n.status==="Completed").length,plannedCount:s.filter(n=>n.status==="Planned").length}})}return{searchQuery:c,selectedPlatforms:i,selectedGenres:l,selectedTiers:f,ratingRanges:o,filterState:h,filterGames:d,createFilteredGamesStore:m,reset(){c.set(""),i.set([]),l.set([]),f.set([]),o.set({presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]})},readFromURL(a){const e=a.get("search");e!==null&&c.set(e);const t=a.get("platforms");if(t!==null&&t.trim()){const p=t.split(",").map(g=>g.trim()).filter(g=>g);i.set(p)}const s=a.get("genres");if(s!==null&&s.trim()){const p=s.split(",").map(g=>g.trim()).filter(g=>g);l.set(p)}const n=a.get("tiers");if(n!==null&&n.trim()){const p=n.split(",").map(g=>g.trim()).filter(g=>g);f.set(p)}const r=a.get("ratingPresentation"),P=a.get("ratingStory"),S=a.get("ratingGameplay"),$=a.get("ratingTotal"),y=u(o),x={...y};function b(p,g){if(!p||!p.includes(","))return g;const[L,F]=p.split(","),T=parseFloat(L),N=parseFloat(F);return isNaN(T)||isNaN(N)?g:[T,N]}x.presentation=b(r,y.presentation),x.story=b(P,y.story),x.gameplay=b(S,y.gameplay),x.total=b($,y.total),o.set(x)},writeToURL(){if(!(typeof window>"u"))try{const a=u(c),e=u(i),t=u(l),s=u(f),n=u(o),r=new URL(window.location.href);a.trim()?r.searchParams.set("search",a.trim()):r.searchParams.delete("search"),e.length>0?r.searchParams.set("platforms",e.join(",")):r.searchParams.delete("platforms"),t.length>0?r.searchParams.set("genres",t.join(",")):r.searchParams.delete("genres"),s.length>0?r.searchParams.set("tiers",s.join(",")):r.searchParams.delete("tiers");const[P,S]=n.presentation,[$,y]=n.story,[x,b]=n.gameplay,[p,g]=n.total;P>0||S<10?r.searchParams.set("ratingPresentation",`${P},${S}`):r.searchParams.delete("ratingPresentation"),$>0||y<10?r.searchParams.set("ratingStory",`${$},${y}`):r.searchParams.delete("ratingStory"),x>0||b<10?r.searchParams.set("ratingGameplay",`${x},${b}`):r.searchParams.delete("ratingGameplay"),p>0||g<20?r.searchParams.set("ratingTotal",`${p},${g}`):r.searchParams.delete("ratingTotal"),D(r.toString(),{})}catch(a){(!(a instanceof Error)||!a.message.includes("router is initialized"))&&console.warn("Failed to update URL:",a)}},addPlatform(a){i.update(e=>e.includes(a)?e:[...e,a])},removePlatform(a){i.update(e=>e.filter(t=>t!==a))},togglePlatform(a){i.update(e=>e.includes(a)?e.filter(t=>t!==a):[...e,a])},addGenre(a){l.update(e=>e.includes(a)?e:[...e,a])},removeGenre(a){l.update(e=>e.filter(t=>t!==a))},toggleGenre(a){l.update(e=>e.includes(a)?e.filter(t=>t!==a):[...e,a])},addTier(a){f.update(e=>e.includes(a)?e:[...e,a])},removeTier(a){f.update(e=>e.filter(t=>t!==a))},toggleTier(a){f.update(e=>e.includes(a)?e.filter(t=>t!==a):[...e,a])},setRatingRange(a,e,t){o.update(s=>({...s,[a]:[e,t]}))},getActiveFilterCount(){const a=u(c),e=u(i),t=u(l),s=u(f),n=u(o);let r=0;return a.trim().length>0&&r++,r+=e.length,r+=t.length,r+=s.length,(n.presentation[0]>0||n.presentation[1]<10)&&r++,(n.story[0]>0||n.story[1]<10)&&r++,(n.gameplay[0]>0||n.gameplay[1]<10)&&r++,(n.total[0]>0||n.total[1]<20)&&r++,r},hasActiveFilters(){const a=u(c),e=u(i),t=u(l),s=u(f),n=u(o);return a.trim().length>0||e.length>0||t.length>0||s.length>0||n.presentation[0]>0||n.presentation[1]<10||n.story[0]>0||n.story[1]<10||n.gameplay[0]>0||n.gameplay[1]<10||n.total[0]>0||n.total[1]<20},resetAllFilters(){c.set(""),i.set([]),l.set([]),f.set([]),o.set({presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]})}}}const q=E(),J={PC:"bg-[#4c1d95] text-[#a78bfa]",PS4:"bg-[#f59e0b] text-[#fef3c7]",PS3:"bg-[#ef4444] text-[#fecaca]",PS2:"bg-[#a855f7] text-[#e9d5ff]",PS1:"bg-[#f97316] text-white",Switch:"bg-[#22c55e] text-[#dcfce7]","3DS":"bg-[#ec4899] text-[#fce7f3]",N64:"bg-[#eab308] text-[#fef3c7]",GameCube:"bg-[#06b6d4] text-[#cffafe]","Game Boy Advance":"bg-[#dc2626] text-[#fca5a5]",Xbox:"bg-[#166534] text-[#dcfce7]","Xbox 360":"bg-[#65a30d] text-[#f7f9e3]",Dreamcast:"bg-[#0d9488] text-[#ccfbf1]"},X={Platformer:"bg-[#ea580c] text-[#fed7aa]","Action Platformer":"bg-[#ef4444] text-[#fecaca]","Puzzle Platformer":"bg-[#a855f7] text-[#e9d5ff]","Story Platformer":"bg-[#f97316] text-white","Story Adventure":"bg-[#eab308] text-[#fef3c7]","Action Adventure":"bg-[#06b6d4] text-[#cffafe]","Survival Horror":"bg-[#9333ea] text-[#f3e8ff]","Story Puzzle":"bg-[#ec4899] text-[#fce7f3]",Puzzle:"bg-[#22c55e] text-[#dcfce7]","Action RPG":"bg-[#f59e0b] text-[#fef3c7]","Classic RPG":"bg-[#dc2626] text-[#fca5a5]","Japanese RPG":"bg-[#059669] text-[#a7f3d0]","Sandbox RPG":"bg-[#0891b2] text-[#ecfeff]","Story RPG":"bg-[#be123c] text-[#f9a8d4]",FPS:"bg-[#b91c1c] text-[#fecaca]",Action:"bg-[#7f1d1d] text-[#fecaca]","Bullet Hell":"bg-[#991b1b] text-[#fca5a5]","Hack & Slash":"bg-[#92400e] text-[#fed7aa]",Survival:"bg-[#16a34a] text-[#dcfce7]",Strategy:"bg-[#6366f1] text-[#e0e7ff]",Metroidvania:"bg-[#4c1d95] text-[#ddd6fe]",Roguelike:"bg-[#c2410c] text-[#fed7aa]","Story Horror":"bg-[#581c87] text-[#d8b4fe]","Horror RPG":"bg-[#0d9488] text-[#ccfbf1]"},V={"S - Masterpiece":"bg-[#dc2626] text-white","A - Amazing":"bg-[#f97316] text-white","B - Great":"bg-[#eab308] text-white","C - Good":"bg-[#22c55e] text-white","D - Decent":"bg-[#06b6d4] text-white","E - Bad":"bg-[#6b7280] text-white"},H={S:"S - Masterpiece",A:"A - Amazing",B:"B - Great",C:"C - Good",D:"D - Decent",E:"E - Bad"},W=c=>H[c]||c;function Y(c,i){const l=z(i,["children","$$slots","$$events","$$legacy"]);/**
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
 */const f=[["line",{x1:"6",x2:"10",y1:"11",y2:"11"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"}]];R(c,A({name:"gamepad-2"},()=>l,{get iconNode(){return f},children:(o,h)=>{var d=M(),m=w(d);C(m,i,"default",{}),v(o,d)},$$slots:{default:!0}}))}function Z(c,i){const l=z(i,["children","$$slots","$$events","$$legacy"]);/**
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
 */const f=[["path",{d:"M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"}],["path",{d:"M2 6h4"}],["path",{d:"M2 10h4"}],["path",{d:"M2 14h4"}],["path",{d:"M2 18h4"}],["path",{d:"M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"}]];R(c,A({name:"notebook-pen"},()=>l,{get iconNode(){return f},children:(o,h)=>{var d=M(),m=w(d);C(m,i,"default",{}),v(o,d)},$$slots:{default:!0}}))}function ee(c,i){const l=z(i,["children","$$slots","$$events","$$legacy"]);/**
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
 */const f=[["path",{d:"M2 3h20"}],["path",{d:"M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"}],["path",{d:"m7 21 5-5 5 5"}]];R(c,A({name:"presentation"},()=>l,{get iconNode(){return f},children:(o,h)=>{var d=M(),m=w(d);C(m,i,"default",{}),v(o,d)},$$slots:{default:!0}}))}export{X as G,Z as N,J as P,V as T,ee as a,Y as b,K as c,q as f,W as g,k as m};
