import"./DsnmJJEf.js";import"./vulFyjHK.js";import{w as l,x as g,k as x}from"./DU9y3gmg.js";import{I as m,s as p}from"./BLDBUU8C.js";import{l as u,s as h}from"./7rY9wKu4.js";function G(a,c={}){const{maxSize:s=5,ttl:f=5e3}=c,e=new Map;return(r,t)=>{const n=r.map(o=>o.id).sort().join(","),$=JSON.stringify(t),d=`${n}|${$}`,i=e.get(d);if(i){if(Date.now()-i.timestamp<f)return i.value;e.delete(d)}const b=a(r,t);if(e.set(d,{value:b,timestamp:Date.now()}),e.size>s){const o=e.keys().next().value;o&&e.delete(o)}return b}}function A(a,c={}){const{maxSize:s=5,ttl:f=3e3}=c,e=new Map;return(r,t,n)=>{const d=`${r.map(o=>o.id).sort().join(",")}|${t}|${n}`,i=e.get(d);if(i){if(Date.now()-i.timestamp<f)return i.value;e.delete(d)}const b=a(r,t,n);if(e.set(d,{value:b,timestamp:Date.now()}),e.size>s){const o=e.keys().next().value;o&&e.delete(o)}return b}}const _={PC:"bg-[#4c1d95] text-[#a78bfa]",PS4:"bg-[#f59e0b] text-[#fef3c7]",PS3:"bg-[#ef4444] text-[#fecaca]",PS2:"bg-[#a855f7] text-[#e9d5ff]",PS1:"bg-[#f97316] text-white",Switch:"bg-[#22c55e] text-[#dcfce7]","3DS":"bg-[#ec4899] text-[#fce7f3]",N64:"bg-[#eab308] text-[#fef3c7]",GameCube:"bg-[#06b6d4] text-[#cffafe]","Game Boy Advance":"bg-[#dc2626] text-[#fca5a5]",Xbox:"bg-[#166534] text-[#dcfce7]","Xbox 360":"bg-[#65a30d] text-[#f7f9e3]",Dreamcast:"bg-[#0d9488] text-[#ccfbf1]"},M={Platformer:"bg-[#ea580c] text-[#fed7aa]","Action Platformer":"bg-[#ef4444] text-[#fecaca]","Puzzle Platformer":"bg-[#a855f7] text-[#e9d5ff]","Story Platformer":"bg-[#f97316] text-white","Story Adventure":"bg-[#eab308] text-[#fef3c7]","Action Adventure":"bg-[#06b6d4] text-[#cffafe]","Survival Horror":"bg-[#9333ea] text-[#f3e8ff]","Story Puzzle":"bg-[#ec4899] text-[#fce7f3]",Puzzle:"bg-[#22c55e] text-[#dcfce7]","Action RPG":"bg-[#f59e0b] text-[#fef3c7]","Classic RPG":"bg-[#dc2626] text-[#fca5a5]","Japanese RPG":"bg-[#059669] text-[#a7f3d0]","Sandbox RPG":"bg-[#0891b2] text-[#ecfeff]","Story RPG":"bg-[#be123c] text-[#f9a8d4]",FPS:"bg-[#b91c1c] text-[#fecaca]",Action:"bg-[#7f1d1d] text-[#fecaca]","Bullet Hell":"bg-[#991b1b] text-[#fca5a5]","Hack & Slash":"bg-[#92400e] text-[#fed7aa]",Survival:"bg-[#16a34a] text-[#dcfce7]",Strategy:"bg-[#6366f1] text-[#e0e7ff]",Metroidvania:"bg-[#4c1d95] text-[#ddd6fe]",Roguelike:"bg-[#c2410c] text-[#fed7aa]","Story Horror":"bg-[#581c87] text-[#d8b4fe]","Horror RPG":"bg-[#0d9488] text-[#ccfbf1]"},R={"S - Masterpiece":"bg-[#dc2626] text-white","A - Amazing":"bg-[#f97316] text-white","B - Great":"bg-[#eab308] text-white","C - Good":"bg-[#22c55e] text-white","D - Decent":"bg-[#06b6d4] text-white","E - Bad":"bg-[#6b7280] text-white"},S={S:"S - Masterpiece",A:"A - Amazing",B:"B - Great",C:"C - Good",D:"D - Decent",E:"E - Bad"},N=a=>S[a]||a;function D(a,c){const s=u(c,["children","$$slots","$$events","$$legacy"]);/**
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
 */const f=[["line",{x1:"6",x2:"10",y1:"11",y2:"11"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"}]];m(a,h({name:"gamepad-2"},()=>s,{get iconNode(){return f},children:(e,r)=>{var t=l(),n=g(t);p(n,c,"default",{}),x(e,t)},$$slots:{default:!0}}))}function C(a,c){const s=u(c,["children","$$slots","$$events","$$legacy"]);/**
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
 */const f=[["path",{d:"M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"}],["path",{d:"M2 6h4"}],["path",{d:"M2 10h4"}],["path",{d:"M2 14h4"}],["path",{d:"M2 18h4"}],["path",{d:"M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"}]];m(a,h({name:"notebook-pen"},()=>s,{get iconNode(){return f},children:(e,r)=>{var t=l(),n=g(t);p(n,c,"default",{}),x(e,t)},$$slots:{default:!0}}))}function k(a,c){const s=u(c,["children","$$slots","$$events","$$legacy"]);/**
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
 */const f=[["path",{d:"M2 3h20"}],["path",{d:"M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"}],["path",{d:"m7 21 5-5 5 5"}]];m(a,h({name:"presentation"},()=>s,{get iconNode(){return f},children:(e,r)=>{var t=l(),n=g(t);p(n,c,"default",{}),x(e,t)},$$slots:{default:!0}}))}export{M as G,C as N,_ as P,R as T,A as a,k as b,D as c,N as g,G as m};
