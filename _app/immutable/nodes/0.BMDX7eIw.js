import{g as Te,f as vt,h as ut,T as mt,I as oe,s as ce,l as ft,C as gt,e as Ye,j as Qe,d as se,r as nt,b as ye,c as Y,n as lt,a as ne,P as ot,N as ct,G as dt}from"../chunks/_elO8lag.js";import"../chunks/DsnmJJEf.js";import{i as pe,p as me,l as I,m as L,f as G,s as o,b as g,c as fe,j as K,d as i,n as t,g as r,a5 as ee,a as Z,t as Q,h as O,k as le,a6 as we,ah as Ft,o as Ot,ai as At,w as ie,v as Et,aj as Dt,$ as Bt,ak as Vt}from"../chunks/n759wMWL.js";import{i as j,l as de,s as ve,p as Ne}from"../chunks/l5podWyg.js";import{p as Pe}from"../chunks/Bc3ezjVN.js";import{b as je}from"../chunks/gtQZzKR0.js";import{f as C,a as re}from"../chunks/DUeMv9x1.js";import"../chunks/CxIAlbqE.js";async function It(n){return await Te.loadGames(n),{}}const gr=Object.freeze(Object.defineProperty({__proto__:null,load:It},Symbol.toStringTag,{value:"Module"}));var Ut=G('<button type="button" class="clear-button svelte-yyldap" aria-label="Clear search"><span aria-hidden="true">×</span></button>'),Ht=G('<div class="search-bar-container svelte-yyldap"><div class="search-bar svelte-yyldap"><span class="search-icon svelte-yyldap" aria-hidden="true">🔍</span> <input type="text" placeholder="Search games..." class="search-input svelte-yyldap" aria-label="Search games" autocomplete="off" spellcheck="false"/> <!></div></div>');function Qt(n,a){me(a,!0);let e,s,l=K("");I(()=>C.searchQuery.subscribe(z=>{L(l,z,!0)})),I(()=>{e&&e.focus()});function v(R){const U=R.target.value;s&&clearTimeout(s),s=setTimeout(()=>{C.searchQuery.set(U),C.writeToURL()},300)}function c(){e&&(e.value="",e.focus()),C.searchQuery.set(""),C.writeToURL(),s&&clearTimeout(s)}function y(R){R.key==="Escape"&&e&&e.select()}var A=Ht(),M=i(A),b=o(i(M),2);b.__input=v,b.__keydown=y,je(b,R=>e=R,()=>e);var B=o(b,2);{var T=R=>{var z=Ut();z.__click=c,g(R,z)};j(B,R=>{t(l)&&R(T)})}r(M),r(A),g(n,A),fe()}pe(["input","keydown","click"]);const Kt=n=>vt[n]||"bg-[#6b7280] text-[#f9fafb]",Yt=n=>ut[n]||"bg-[#6b7280] text-[#f9fafb]",qt=n=>mt[n]||"bg-gray-600 text-white",Wt=n=>{const a=new Set;return n.forEach(e=>{e.platform&&a.add(e.platform)}),Array.from(a).sort()},Jt=n=>{const a=new Set;return n.forEach(e=>{e.genre&&a.add(e.genre)}),Array.from(a).sort()},Xt=n=>{const a=new Set;n.forEach(l=>{l.status==="Completed"&&l.tier&&a.add(l.tier)});const e={S:"S - Masterpiece",A:"A - Amazing",B:"B - Great",C:"C - Good",D:"D - Decent",E:"E - Bad"};return Array.from(a).map(l=>e[l]).filter(Boolean).sort((l,v)=>{const c=["S - Masterpiece","A - Amazing","B - Great","C - Good","D - Decent","E - Bad"];return c.indexOf(l)-c.indexOf(v)})},Zt=n=>({platforms:Wt(n),genres:Jt(n),tiers:Xt(n)});function ea(n,a){const e=de(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"m15 18-6-6 6-6"}]];oe(n,ve({name:"chevron-left"},()=>e,{get iconNode(){return s},children:(l,v)=>{var c=ee(),y=Z(c);ce(y,a,"default",{}),g(l,c)},$$slots:{default:!0}}))}function ta(n,a){const e=de(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"m9 18 6-6-6-6"}]];oe(n,ve({name:"chevron-right"},()=>e,{get iconNode(){return s},children:(l,v)=>{var c=ee(),y=Z(c);ce(y,a,"default",{}),g(l,c)},$$slots:{default:!0}}))}function aa(n,a){const e=de(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2"}],["path",{d:"M3 9h18"}],["path",{d:"M3 15h18"}],["path",{d:"M9 3v18"}],["path",{d:"M15 3v18"}]];oe(n,ve({name:"grid-3x3"},()=>e,{get iconNode(){return s},children:(l,v)=>{var c=ee(),y=Z(c);ce(y,a,"default",{}),g(l,c)},$$slots:{default:!0}}))}function ra(n,a){const e=de(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"M3 5h.01"}],["path",{d:"M3 12h.01"}],["path",{d:"M3 19h.01"}],["path",{d:"M8 5h13"}],["path",{d:"M8 12h13"}],["path",{d:"M8 19h13"}]];oe(n,ve({name:"list"},()=>e,{get iconNode(){return s},children:(l,v)=>{var c=ee(),y=Z(c);ce(y,a,"default",{}),g(l,c)},$$slots:{default:!0}}))}function ia(n,a){const e=de(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];oe(n,ve({name:"monitor"},()=>e,{get iconNode(){return s},children:(l,v)=>{var c=ee(),y=Z(c);ce(y,a,"default",{}),g(l,c)},$$slots:{default:!0}}))}function sa(n,a){const e=de(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["circle",{cx:"18",cy:"5",r:"3"}],["circle",{cx:"6",cy:"12",r:"3"}],["circle",{cx:"18",cy:"19",r:"3"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49"}]];oe(n,ve({name:"share-2"},()=>e,{get iconNode(){return s},children:(l,v)=>{var c=ee(),y=Z(c);ce(y,a,"default",{}),g(l,c)},$$slots:{default:!0}}))}function na(n,a){const e=de(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]];oe(n,ve({name:"star"},()=>e,{get iconNode(){return s},children:(l,v)=>{var c=ee(),y=Z(c);ce(y,a,"default",{}),g(l,c)},$$slots:{default:!0}}))}function la(n,a){const e=de(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor"}]];oe(n,ve({name:"tag"},()=>e,{get iconNode(){return s},children:(l,v)=>{var c=ee(),y=Z(c);ce(y,a,"default",{}),g(l,c)},$$slots:{default:!0}}))}function Ke(n,a){const e=de(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18"}],["path",{d:"M4 22h16"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6"}]];oe(n,ve({name:"trophy"},()=>e,{get iconNode(){return s},children:(l,v)=>{var c=ee(),y=Z(c);ce(y,a,"default",{}),g(l,c)},$$slots:{default:!0}}))}function oa(n,a){const e=de(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]];oe(n,ve({name:"x"},()=>e,{get iconNode(){return s},children:(l,v)=>{var c=ee(),y=Z(c);ce(y,a,"default",{}),g(l,c)},$$slots:{default:!0}}))}function ca(n,a,e,s){a().forEach(l=>{e.type==="platforms"?C.removePlatform(l):e.type==="genres"?C.removeGenre(l):e.type==="tiers"&&C.removeTier(l)}),L(s,!1)}var da=G('<span class="selected-count bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full svelte-1uy8f65"> </span>'),va=(n,a,e)=>a(e),ua=G('<button type="button"> </button>'),ma=G('<div class="filter-actions mt-3 flex justify-center svelte-1uy8f65"><button type="button" class="text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),fa=G('<div class="empty-state text-center py-2 svelte-1uy8f65"><span class="text-muted-foreground text-sm"> </span></div>'),ga=G('<div class="filter-options-dropdown svelte-1uy8f65"><div class="filter-options-section svelte-1uy8f65"><div class="filter-options-grid svelte-1uy8f65"></div> <!> <!></div></div>'),pa=G('<div class="filter-dropdown svelte-1uy8f65"><button><!> <span class="filter-label svelte-1uy8f65"> </span> <!></button> <!></div>');function He(n,a){me(a,!0);let e=Ne(a,"selectedOptions",19,()=>[]),s=K(!1),l;function v(m){const d=m.target,p=document.querySelector(".filter-options-dropdown");p&&p.contains(d)||l&&!l.contains(d)&&L(s,!1)}I(()=>{if(t(s))return document.addEventListener("click",v),()=>{document.removeEventListener("click",v)}});function c(m){a.type==="platforms"?C.togglePlatform(m):a.type==="genres"?C.toggleGenre(m):a.type==="tiers"&&C.toggleTier(m)}function y(m){return a.type==="platforms"?Kt(m):a.type==="genres"?Yt(m):a.type==="tiers"?qt(m):"bg-gray-600 text-white"}function A(){return e().length===0?"bg-surface hover:bg-accent hover:text-accent-foreground":"bg-accent text-accent-foreground"}function M(m){m.key==="Escape"?(L(s,!1),m.preventDefault()):(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),L(s,!t(s)))}function b(){return{"aria-expanded":t(s),"aria-haspopup":"listbox","aria-label":`Filter by ${a.label.toLowerCase()}`}}var B=pa(),T=i(B),R=()=>L(s,!t(s));ft(T,(m,d,p)=>({type:"button",class:`filter-button ${m??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:R,onkeydown:M,...d,[gt]:p}),[A,b,()=>({selected:e().length>0})],void 0,"svelte-1uy8f65");var z=i(T);{var U=m=>{ia(m,{size:16,class:"text-gray-600 dark:text-gray-400"})},te=m=>{var d=ee(),p=Z(d);{var $=E=>{la(E,{size:16,class:"text-gray-600 dark:text-gray-400"})},N=E=>{var H=ee(),_=Z(H);{var w=k=>{Ke(k,{size:16,class:"text-gray-600 dark:text-gray-400"})};j(_,k=>{a.type==="tiers"&&k(w)},!0)}g(E,H)};j(p,E=>{a.type==="genres"?E($):E(N,!1)},!0)}g(m,d)};j(z,m=>{a.type==="platforms"?m(U):m(te,!1)})}var X=o(z,2),u=i(X);r(X);var f=o(X,2);{var S=m=>{var d=da(),p=i(d,!0);r(d),Q(()=>O(p,e().length)),g(m,d)};j(f,m=>{e().length>0&&m(S)})}r(T);var V=o(T,2);{var q=m=>{var d=ga(),p=i(d),$=i(p);Ye($,20,()=>a.options,w=>w,(w,k)=>{var P=ua();P.__click=[va,c,k];var D=i(P,!0);r(P),Q((J,ge,ae)=>{se(P,1,`filter-option-item ${J??""} ${ge??""}`,"svelte-1uy8f65"),O(D,ae)},[()=>y(k),()=>e().includes(k)?"selected":"",()=>a.type==="tiers"?Qe(k):k]),g(w,P)}),r($);var N=o($,2);{var E=w=>{var k=ma(),P=i(k);P.__click=[ca,e,a,s],r(k),g(w,k)};j(N,w=>{e().length>0&&w(E)})}var H=o(N,2);{var _=w=>{var k=fa(),P=i(k),D=i(P);r(P),r(k),Q(J=>O(D,`No ${J??""} available`),[()=>a.label.toLowerCase()]),g(w,k)};j(H,w=>{a.options.length===0&&w(_)})}r(p),r(d),g(m,d)};j(V,m=>{t(s)&&m(q)})}r(B),je(B,m=>l=m,()=>l),Q(()=>O(u,`Filter by ${a.label??""}`)),g(n,B),fe()}pe(["click"]);function ba(n,a,e){const s=n.target,l=parseInt(s.value);a(l,t(e),!0)}function ya(n,a,e){const s=n.target,l=parseInt(s.value);a(t(e),l,!1)}function ha(n,a,e){a(e.minLimit,e.maxLimit)}var xa=G('<button type="button" class="reset-button svelte-1ugjrx4" title="Reset to default range">Reset</button>'),_a=G('<div class="rating-slider svelte-1ugjrx4"><div class="slider-header svelte-1ugjrx4"><span class="slider-label svelte-1ugjrx4"> </span> <!></div> <div class="slider-container svelte-1ugjrx4"><div class="dual-slider-row svelte-1ugjrx4"><div class="slider-track svelte-1ugjrx4"><div class="slider-fill svelte-1ugjrx4"></div></div> <input type="range" class="slider-thumb slider-thumb-min svelte-1ugjrx4"/> <input type="range" class="slider-thumb slider-thumb-max svelte-1ugjrx4"/></div> <div class="slider-values svelte-1ugjrx4"><span class="value-display min-value svelte-1ugjrx4"> </span> <span class="range-indicator svelte-1ugjrx4">–</span> <span class="value-display max-value svelte-1ugjrx4"> </span></div></div></div>');function wa(n,a){me(a,!0);let e=Ne(a,"step",3,1),s=Ne(a,"disabled",3,!1),l=Ne(a,"onRangeChange",3,()=>{}),v=K(le(a.minValue)),c=K(le(a.maxValue));I(()=>{L(v,a.minValue,!0),L(c,a.maxValue,!0)});function y(_,w,k){return Math.min(Math.max(_,w),k)}function A(_,w,k=!1){if(s())return;let P=y(_,a.minLimit,a.maxLimit),D=y(w,a.minLimit,a.maxLimit);k?P=Math.min(P,D):D=Math.max(D,P),P=Math.round(P/e())*e(),D=Math.round(D/e())*e(),L(v,P,!0),L(c,D,!0),l()(P,D)}function M(){return(t(v)-a.minLimit)/(a.maxLimit-a.minLimit)*100}function b(){return(t(c)-a.minLimit)/(a.maxLimit-a.minLimit)*100}function B(){return t(v)===a.minLimit&&t(c)===a.maxLimit}function T(_){return a.maxLimit===20?_>=18?"#dc2626":_>=16?"#f97316":_>=14?"#eab308":_>=12?"#22c55e":_>=10?"#06b6d4":"#6b7280":_>=9?"#dc2626":_>=8?"#f97316":_>=7?"#eab308":_>=6?"#22c55e":_>=5?"#06b6d4":"#6b7280"}var R=_a(),z=i(R),U=i(z),te=i(U,!0);r(U);var X=o(U,2);{var u=_=>{var w=xa();w.__click=[ha,A,a],Q(()=>w.disabled=s()),g(_,w)};j(X,_=>{B()||_(u)})}r(z);var f=o(z,2),S=i(f),V=i(S),q=i(V);r(V);var m=o(V,2);nt(m),m.__input=[ba,A,c];var d=o(m,2);nt(d),d.__input=[ya,A,v],r(S);var p=o(S,2),$=i(p),N=i($,!0);r($);var E=o($,4),H=i(E,!0);r(E),r(p),r(f),r(R),Q((_,w,k,P,D,J,ge,ae)=>{ye(R,`--min-color: ${_??""}; --max-color: ${w??""}`),O(te,a.label),ye(q,`left: ${k??""}%; width: ${P??""}%`),Y(m,"min",a.minLimit),Y(m,"max",a.maxLimit),Y(m,"step",e()),lt(m,t(v)),m.disabled=s(),Y(m,"aria-label",`Minimum ${D??""} rating`),Y(d,"min",a.minLimit),Y(d,"max",a.maxLimit),Y(d,"step",e()),lt(d,t(c)),d.disabled=s(),Y(d,"aria-label",`Maximum ${J??""} rating`),ye($,`color: ${ge??""}`),O(N,t(v)),ye(E,`color: ${ae??""}`),O(H,t(c))},[()=>T(t(v)),()=>T(t(c)),M,()=>b()-M(),()=>a.label.toLowerCase(),()=>a.label.toLowerCase(),()=>T(t(v)),()=>T(t(c))]),g(n,R),fe()}pe(["click","input"]);function ka(n,a){C.setRatingRange("presentation",0,10),C.setRatingRange("story",0,10),C.setRatingRange("gameplay",0,10),C.setRatingRange("total",0,20),L(a,!1)}var Ga=G('<span class="selected-count bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full svelte-1vf89kc"> </span>'),Ma=G('<div class="rating-slider-item svelte-1vf89kc"><!></div>'),Pa=G('<div class="filter-actions mt-4 flex justify-center svelte-1vf89kc"><button type="button" class="text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),Ta=G('<div class="ratings-filter-dropdown svelte-1vf89kc"><div class="filter-options-section svelte-1vf89kc"><div class="filter-options-grid svelte-1vf89kc"></div> <!></div></div>'),$a=G('<div class="ratings-filter svelte-1vf89kc"><button><!> <span class="filter-label svelte-1vf89kc">Filter by Ratings</span> <!></button> <!></div>');function Sa(n,a){me(a,!0);const e={presentation:{label:"Presentation",maxValue:10},story:{label:"Story",maxValue:10},gameplay:{label:"Gameplay",maxValue:10},total:{label:"Score",maxValue:20}};let s=K(!1),l,v=K(le({presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}));I(()=>C.ratingRanges.subscribe(S=>{L(v,S,!0)}));function c(f){const S=f.target,V=document.querySelector(".ratings-filter-dropdown");V&&V.contains(S)||l&&!l.contains(S)&&L(s,!1)}I(()=>{if(t(s))return document.addEventListener("click",c),()=>{document.removeEventListener("click",c)}});function y(){return t(v).presentation[0]>0||t(v).presentation[1]<10||t(v).story[0]>0||t(v).story[1]<10||t(v).gameplay[0]>0||t(v).gameplay[1]<10||t(v).total[0]>0||t(v).total[1]<20}function A(){return y()?"bg-accent text-accent-foreground":"bg-surface hover:bg-accent hover:text-accent-foreground"}function M(f){f.key==="Escape"?(L(s,!1),f.preventDefault()):(f.key==="Enter"||f.key===" ")&&(f.preventDefault(),L(s,!t(s)))}function b(){return{"aria-expanded":t(s),"aria-haspopup":"listbox","aria-label":"Filter by ratings"}}var B=$a(),T=i(B),R=()=>L(s,!t(s));ft(T,(f,S,V)=>({type:"button",class:`filter-button ${f??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:R,onkeydown:M,...S,[gt]:V}),[A,b,()=>({selected:y()})],void 0,"svelte-1vf89kc");var z=i(T);na(z,{size:16,class:"text-gray-600 dark:text-gray-400"});var U=o(z,4);{var te=f=>{var S=Ga(),V=i(S,!0);r(S),Q(q=>O(V,q),[()=>[t(v).presentation,t(v).story,t(v).gameplay,t(v).total].filter(([q,m],d)=>{const p=[[0,10],[0,10],[0,10],[0,20]];return q>p[d][0]||m<p[d][1]}).length]),g(f,S)};j(U,f=>{y()&&f(te)})}r(T);var X=o(T,2);{var u=f=>{var S=Ta(),V=i(S),q=i(V);Ye(q,21,()=>Object.entries(e),([p,$])=>p,(p,$)=>{var N=we(()=>Ft(t($),2));let E=()=>t(N)[0],H=()=>t(N)[1];const _=we(E),w=we(()=>t(v)[t(_)]);var k=Ma(),P=i(k);wa(P,{get label(){return H().label},get minValue(){return t(w)[0]},get maxValue(){return t(w)[1]},step:1,minLimit:0,get maxLimit(){return H().maxValue},onRangeChange:(D,J)=>C.setRatingRange(t(_),D,J)}),r(k),g(p,k)}),r(q);var m=o(q,2);{var d=p=>{var $=Pa(),N=i($);N.__click=[ka,s],r($),g(p,$)};j(m,p=>{y()&&p(d)})}r(V),r(S),g(f,S)};j(X,f=>{t(s)&&f(u)})}r(B),je(B,f=>l=f,()=>l),g(n,B),fe()}pe(["click"]);function Ca(n,a){n.target===t(a)&&ne.closeModal()}function La(n){(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),ne.closeModal())}async function Ra(n,a){if(t(a).activeGame)try{const e=new URL(window.location.href),s=t(a).activeGame.title.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim().replace(/^-|-$/g,"");e.searchParams.set("game",s),await navigator.clipboard.writeText(e.toString())}catch(e){console.warn("Failed to copy to clipboard:",e)}}var za=G('<button class="absolute top-1/2 left-2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70" aria-label="Previous game"><!></button>'),Na=G('<button class="absolute top-1/2 right-2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70" aria-label="Next game"><!></button>'),ja=()=>ne.closeModal(),Fa=G('<div class="absolute top-4 right-4 rounded-md bg-blue-600 px-3 py-1 text-sm font-semibold text-white">👥 Co-op</div>'),Oa=G('<br/> <span class="font-semibold" style="font-size: 1.2rem; line-height: 1.2; color: var(--color-text-secondary);"> </span>',1),Aa=G('<span class="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white">Co-op</span>'),Ea=G("<span> </span>"),Da=G('<div><div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Hours Played</div> <div class="font-semibold" style="color: var(--color-text-primary);"> </div></div>'),Ba=G('<div><div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Time to Beat</div> <div class="font-semibold" style="color: var(--color-text-primary);"> </div></div>'),Va=G('<div class="mt-6 rounded-lg border border-blue-200 from-blue-50 to-purple-50 p-4 dark:border-blue-800 dark:from-blue-900/80 dark:to-purple-900/80"><div class="flex items-center justify-center gap-2"><!> <span class="text-lg font-bold" style="color: var(--color-text-primary);"> </span></div></div>'),Ia=G('<div class="space-y-4"><h3 class="mb-4 text-xl font-semibold" style="color: var(--color-text-primary);">Ratings</h3> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Presentation</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);"> </span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div></div></div></div> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Story</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);"> </span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div></div></div></div> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Gameplay</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);"> </span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div></div></div></div> <!></div>'),Ua=G('<div class="space-y-4"><h3 class="mb-4 text-xl font-semibold" style="color: var(--color-text-primary);">Ratings</h3> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Presentation</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">Not rated</span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300" style="width: 0%"></div></div></div> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Story</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">Not rated</span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300" style="width: 0%"></div></div></div> <div class="flex items-center gap-3"><div class="flex min-w-0 flex-1 items-center gap-2"><!> <span class="text-sm font-medium" style="color: var(--color-text-secondary);">Gameplay</span></div> <span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">Not rated</span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700"><div class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300" style="width: 0%"></div></div></div> <div class="mt-6 rounded-lg border border-gray-200 from-gray-50 to-gray-50 p-4 dark:border-gray-700"><div class="flex items-center justify-center gap-2"><!> <span class="text-lg font-bold" style="color: var(--color-text-primary);">Game to be completed</span></div></div></div>'),Ha=G('<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-1 backdrop-blur-[8px]" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="modal-title"><!> <!> <button class="absolute top-4 right-16 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-gray-300 shadow-lg transition-all hover:scale-110 hover:bg-white dark:bg-gray-800/90 dark:border-gray-600 dark:hover:bg-gray-700" aria-label="Share game"><!></button> <button class="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600" aria-label="Close modal"><!></button> <div class="relative h-[600px] w-full max-w-4xl rounded-xl shadow-2xl" style="background-color: var(--color-surface);"><div class="grid grid-cols-1 gap-0 lg:grid-cols-[400px_1fr]"><div class="relative overflow-hidden rounded-l-lg"><img class="h-full w-full object-cover" style="width: 400px; height: 600px;" loading="lazy"/> <!></div> <div class="max-h-[60vh] overflow-y-auto pt-4 pr-6 pb-6 pl-6 lg:pt-6 lg:pr-8 lg:pb-8 lg:pl-8"><h1 id="modal-title" class="flex flex-col justify-center text-3xl font-bold" style="height: 65px; margin-bottom: 15px; color: var(--color-text-primary);"> <!></h1> <div class="mb-6 flex items-center justify-between"><div class="flex flex-wrap gap-2"><span> </span> <span> </span> <!></div> <!></div> <div class="mb-8 grid grid-cols-2 gap-4"><div><div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Year Released</div> <div class="font-semibold" style="color: var(--color-text-primary);"> </div></div> <!> <div><div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Finished Date</div> <div class="font-semibold" style="color: var(--color-text-primary);"> </div></div> <div><div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Co-op</div> <div class="font-semibold" style="color: var(--color-text-primary);"> </div></div></div> <!></div></div></div></div>');function Qa(n,a){me(a,!0);let e=K(le(ne.getState())),s=K(le([]));I(()=>ne.subscribe(f=>{L(e,f,!0),ne.writeToURL()})),I(()=>Te.subscribe(f=>{L(s,f,!0)}));let l=K(void 0),v=we(()=>()=>{if(!t(e).activeGame?.title)return{mainTitle:"",subtitle:null};const u=t(e).activeGame.title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);return u?{mainTitle:u[1].trim(),subtitle:`(${u[2]})`}:{mainTitle:t(e).activeGame.title,subtitle:null}}),c=we(()=>()=>t(e).activeGame?t(s).findIndex(u=>u.id===t(e).activeGame?.id):-1);function y(){const u=t(c)();if(u>0){const f=t(s)[u-1];ne.openViewModal(f)}}function A(){const u=t(c)();if(u<t(s).length-1){const f=t(s)[u+1];ne.openViewModal(f)}}function M(u){u.key==="Escape"?ne.closeModal():u.key==="ArrowLeft"?(u.preventDefault(),y()):u.key==="ArrowRight"&&(u.preventDefault(),A())}function b(u){if(!u)return"Not completed";try{return new Date(u).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}catch{return"Invalid date"}}function B(u){if(!u)return"bg-gray-400";const f=Qe(u);return mt[f]||"bg-gray-400"}function T(u){return vt[u]||"bg-gray-600 text-white"}function R(u){return ut[u]||"bg-gray-600 text-white"}function z(u){return u>=8?"bg-gradient-to-r from-[#388E3C] to-[#4CAF50]":u>=6?"bg-gradient-to-r from-[#A4D454] to-[#8BC34A]":u>=5?"bg-gradient-to-r from-[#FFC107] to-[#FFEB3B]":u>=3?"bg-gradient-to-r from-[#FF832B] to-[#FF9800]":"bg-gradient-to-r from-[#D32F2F] to-[#F44336]"}Ot(()=>{document.addEventListener("keydown",M)}),At(()=>{document.removeEventListener("keydown",M)});var U=ee(),te=Z(U);{var X=u=>{var f=Ha();f.__click=[Ca,l],f.__keydown=[La];var S=i(f);{var V=h=>{var x=za();x.__click=y;var F=i(x);ea(F,{size:32}),r(x),g(h,x)};j(S,h=>{t(c)()>0&&h(V)})}var q=o(S,2);{var m=h=>{var x=Na();x.__click=A;var F=i(x);ta(F,{size:32}),r(x),g(h,x)};j(q,h=>{t(c)()<t(s).length-1&&h(m)})}var d=o(q,2);d.__click=[Ra,e];var p=i(d);sa(p,{size:18,class:"text-gray-700 dark:text-gray-200"}),r(d);var $=o(d,2);$.__click=[ja];var N=i($);oa(N,{size:20,class:"text-gray-600 dark:text-gray-300"}),r($);var E=o($,2),H=i(E),_=i(H),w=i(_),k=o(w,2);{var P=h=>{var x=Fa();g(h,x)};j(k,h=>{t(e).activeGame.coOp==="Yes"&&h(P)})}r(_);var D=o(_,2),J=i(D),ge=i(J),ae=o(ge);{var pt=h=>{var x=Oa(),F=o(Z(x),2),W=i(F,!0);r(F),Q(ue=>O(W,ue),[()=>t(v)().subtitle]),g(h,x)};j(ae,h=>{t(v)().subtitle&&h(pt)})}r(J);var Fe=o(J,2),Oe=i(Fe),$e=i(Oe),bt=i($e,!0);r($e);var Se=o($e,2),yt=i(Se,!0);r(Se);var ht=o(Se,2);{var xt=h=>{var x=Aa();g(h,x)};j(ht,h=>{t(e).activeGame.coOp==="Yes"&&h(xt)})}r(Oe);var _t=o(Oe,2);{var wt=h=>{var x=Ea(),F=i(x,!0);r(x),Q((W,ue)=>{se(x,1,`rounded-md px-3 py-1 text-sm font-semibold text-white ${W??""}`),O(F,ue)},[()=>B(t(e).activeGame.tier),()=>Qe(t(e).activeGame.tier)]),g(h,x)};j(_t,h=>{t(e).activeGame.tier&&h(wt)})}r(Fe);var Ae=o(Fe,2),Ee=i(Ae),qe=o(i(Ee),2),kt=i(qe,!0);r(qe),r(Ee);var We=o(Ee,2);{var Gt=h=>{var x=Da(),F=o(i(x),2),W=i(F,!0);r(F),r(x),Q(()=>O(W,t(e).activeGame.hoursPlayed||"Not completed")),g(h,x)},Mt=h=>{var x=Ba(),F=o(i(x),2),W=i(F,!0);r(F),r(x),Q(()=>O(W,t(e).activeGame.timeToBeat)),g(h,x)};j(We,h=>{t(e).activeGame.status==="Completed"?h(Gt):h(Mt,!1)})}var De=o(We,2),Je=o(i(De),2),Pt=i(Je,!0);r(Je),r(De);var Xe=o(De,2),Ze=o(i(Xe),2),Tt=i(Ze,!0);r(Ze),r(Xe),r(Ae);var $t=o(Ae,2);{var St=h=>{var x=Ia(),F=o(i(x),2),W=i(F),ue=i(W);ot(ue,{size:20,class:"flex-shrink-0 text-cyan-500"}),ie(2),r(W);var be=o(W,2),Ce=i(be);r(be);var Le=o(be,2),he=i(Le);r(Le),r(F);var xe=o(F,2),ke=i(xe),Re=i(ke);ct(Re,{size:20,class:"flex-shrink-0 text-amber-600"}),ie(2),r(ke);var _e=o(ke,2),Be=i(_e);r(_e);var et=o(_e,2),tt=i(et);r(et),r(xe);var Ve=o(xe,2),Ie=i(Ve),Lt=i(Ie);dt(Lt,{size:20,class:"flex-shrink-0 text-pink-500"}),ie(2),r(Ie);var Ue=o(Ie,2),Rt=i(Ue);r(Ue);var at=o(Ue,2),rt=i(at);r(at),r(Ve);var zt=o(Ve,2);{var Nt=Ge=>{var Me=Va(),ze=i(Me),it=i(ze);Ke(it,{size:24,class:"text-yellow-500"});var st=o(it,2),jt=i(st);r(st),r(ze),r(Me),Q(()=>O(jt,`Total Score: ${t(e).activeGame.score??""}/20`)),g(Ge,Me)};j(zt,Ge=>{t(e).activeGame.score!==null&&Ge(Nt)})}r(x),Q((Ge,Me,ze)=>{O(Ce,`${t(e).activeGame.ratingPresentation??""}/10`),se(he,1,`h-2 rounded-full ${Ge??""} transition-all duration-300`),ye(he,`width: ${t(e).activeGame.ratingPresentation*10}%`),O(Be,`${t(e).activeGame.ratingStory??""}/10`),se(tt,1,`h-2 rounded-full ${Me??""} transition-all duration-300`),ye(tt,`width: ${t(e).activeGame.ratingStory*10}%`),O(Rt,`${t(e).activeGame.ratingGameplay??""}/10`),se(rt,1,`h-2 rounded-full ${ze??""} transition-all duration-300`),ye(rt,`width: ${t(e).activeGame.ratingGameplay*10}%`)},[()=>z(t(e).activeGame.ratingPresentation),()=>z(t(e).activeGame.ratingStory),()=>z(t(e).activeGame.ratingGameplay)]),g(h,x)},Ct=h=>{var x=Ua(),F=o(i(x),2),W=i(F),ue=i(W);ot(ue,{size:20,class:"flex-shrink-0 text-cyan-500"}),ie(2),r(W),ie(4),r(F);var be=o(F,2),Ce=i(be),Le=i(Ce);ct(Le,{size:20,class:"flex-shrink-0 text-amber-600"}),ie(2),r(Ce),ie(4),r(be);var he=o(be,2),xe=i(he),ke=i(xe);dt(ke,{size:20,class:"flex-shrink-0 text-pink-500"}),ie(2),r(xe),ie(4),r(he);var Re=o(he,2),_e=i(Re),Be=i(_e);Ke(Be,{size:24,class:"text-gray-400"}),ie(2),r(_e),r(Re),r(x),g(h,x)};j($t,h=>{t(e).activeGame.status==="Completed"&&t(e).activeGame.ratingPresentation!==null&&t(e).activeGame.ratingStory!==null&&t(e).activeGame.ratingGameplay!==null?h(St):h(Ct,!1)})}r(D),r(H),r(E),r(f),je(f,h=>L(l,h),()=>t(l)),Q((h,x,F,W,ue)=>{Y(w,"src",h),Y(w,"alt",`${t(e).activeGame.title??""} cover`),O(ge,`${x??""} `),se($e,1,`rounded-md px-3 py-1 text-sm font-medium text-white ${F??""}`),O(bt,t(e).activeGame.platform),se(Se,1,`rounded-md px-3 py-1 text-sm font-medium text-white ${W??""}`),O(yt,t(e).activeGame.genre),O(kt,t(e).activeGame.year),O(Pt,ue),O(Tt,t(e).activeGame.coOp==="Yes"?"Yes":"No")},[()=>t(e).activeGame.coverImage.replace(".webp","-detail.webp"),()=>t(v)().mainTitle,()=>T(t(e).activeGame.platform),()=>R(t(e).activeGame.genre),()=>b(t(e).activeGame.finishedDate)]),g(u,f)};j(te,u=>{t(e).isOpen&&t(e).activeGame&&t(e).mode==="view"&&u(X)})}g(n,U),fe()}pe(["click","keydown"]);function Ka(){re.toggleTheme()}var Ya=G('<button type="button" class="theme-toggle svelte-1cmi4dh"><div class="icon-container svelte-1cmi4dh"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></div></button>');function qa(n,a){me(a,!0);let e=K("dark");I(()=>re.theme.subscribe(b=>{L(e,b,!0)}));var s=Ya();s.__click=[Ka];var l=i(s),v=i(l);let c;var y=o(v,2);let A;r(l),r(s),Q((M,b)=>{Y(s,"aria-label",t(e)==="dark"?"Switch to light mode":"Switch to dark mode"),Y(s,"title",t(e)==="dark"?"Switch to light mode":"Switch to dark mode"),c=se(v,0,"sun-icon svelte-1cmi4dh",null,c,M),A=se(y,0,"moon-icon svelte-1cmi4dh",null,A,b)},[()=>({visible:t(e)==="light",hidden:t(e)==="dark"}),()=>({visible:t(e)==="dark",hidden:t(e)==="light"})]),g(n,s),fe()}pe(["click"]);var Wa=G('<header class="header svelte-1elxaub"><div class="header-left svelte-1elxaub"><div class="logo svelte-1elxaub"><picture class="logo-image svelte-1elxaub"><source srcset="logo.webp" type="image/webp"/> <img src="logo.png" alt="Gaming Tracker Logo"/></picture></div></div> <div class="header-right"><!></div></header>');function Ja(n,a){me(a,!0),I(()=>re.theme.subscribe(()=>{}));var e=Wa(),s=o(i(e),2),l=i(s);qa(l,{}),r(s),r(e),g(n,e),fe()}var Xa=(n,a,e)=>a(t(e)),Za=G('<span class="tab-count svelte-12wudpi"> </span>'),er=G('<li class="tab-item svelte-12wudpi" role="presentation"><button type="button" role="tab" aria-controls="main-content"><span class="tab-label svelte-12wudpi"> </span> <!></button></li>'),tr=G('<nav class="navigation-tabs svelte-12wudpi" aria-label="Game navigation"><ul class="tabs-list svelte-12wudpi" role="tablist"></ul></nav>');function ar(n,a){me(a,!0);let e=K("all"),s=K(le({total:0,planned:0,completed:0}));const l=C.createFilteredGamesStore(Te);I(()=>re.activeTab.subscribe(b=>{L(e,b,!0)})),I(()=>l.subscribe(b=>{L(s,{total:b.totalCount,planned:b.plannedCount,completed:b.completedCount},!0)})),I(()=>{if(typeof window<"u"){const M=window.location.hash.replace("#","");let b="all";M==="completed"?b="completed":M==="planned"?b="planned":M==="tierlist"?b="tierlist":b="all",b!==t(e)&&re.activeTab.set(b)}});const v=we(()=>[{id:"all",label:"Games",route:"/",count:t(s).total},{id:"completed",label:"Completed",route:"completed",count:t(s).completed},{id:"planned",label:"Planned",route:"planned",count:t(s).planned},{id:"tierlist",label:"Tier List",route:"tierlist",count:null}]);function c(M){if(M.id!==t(e)&&(re.activeTab.set(M.id),typeof window<"u"&&window.location)){const b=M.id==="all"?"":`#${M.id}`;window.history.replaceState(null,"",`${window.location.pathname}${window.location.search}${b}`)}}var y=tr(),A=i(y);Ye(A,21,()=>t(v),M=>M.id,(M,b)=>{var B=er(),T=i(B);let R;T.__click=[Xa,c,b];var z=i(T),U=i(z,!0);r(z);var te=o(z,2);{var X=u=>{var f=Za(),S=i(f);r(f),Q(()=>{Y(f,"aria-label",`(${t(b).count??""} games)`),O(S,`(${t(b).count??""})`)}),g(u,f)};j(te,u=>{t(b).count!==null&&u(X)})}r(T),r(B),Q(u=>{R=se(T,1,"tab-button svelte-12wudpi",null,R,u),Y(T,"aria-selected",t(e)===t(b).id),Y(T,"tabindex",t(e)===t(b).id?0:-1),Y(T,"title",`Navigate to ${t(b).label??""} games`),O(U,t(b).label)},[()=>({active:t(e)===t(b).id})]),g(M,B)}),r(A),r(y),g(n,y),fe()}pe(["click"]);function rr(){re.toggleViewMode()}var ir=G('<meta name="viewport" content="width=device-width, initial-scale=1.0"/>'),sr=G('<div class="flex flex-col items-center gap-4"><div class="flex flex-wrap items-center justify-center gap-3"><!> <!> <!> <!> <button class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors svelte-12qhfyh" title="Reset all filters">↻ Reset</button> <div class="view-toggle-container"><button class="view-toggle-button flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"><!></button></div></div></div>'),nr=G('<div class="bg-background text-foreground min-h-screen"><!> <!> <section class="filter-section sticky top-[104px] z-30 md:top-[110px] svelte-12qhfyh"><div class="container mx-auto space-y-4 px-6 py-4"><!> <!></div></section> <main style="background-color: var(--color-background);" class="px-6 pt-0 pb-6"><div class="container mx-auto"><!></div></main> <!></div>');function pr(n,a){me(a,!0);let e=!1,s,l=K(le({platforms:[],genres:[],tiers:[]})),v=K("gallery"),c=K("all");I(()=>Te.subscribe(p=>{L(l,Zt(p),!0)})),I(()=>re.viewMode.subscribe(p=>{L(v,p,!0)})),I(()=>re.activeTab.subscribe(p=>{L(c,p,!0)})),I(()=>{if(!e){re.readFromURLWithFilters(Pe.url.searchParams,C);const d=Pe.url.searchParams.get("game");d&&setTimeout(()=>{const p=Te.getGameById(d);p&&ne.openViewModal(p)},100),e=!0}});let y={searchQuery:"",selectedPlatforms:[],selectedGenres:[],selectedTiers:[],ratingRanges:{presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}};C.filterState.subscribe(d=>{y=d}),I(()=>{e&&(s&&clearTimeout(s),s=setTimeout(()=>{re.writeToURLWithFilters(C)},300))}),I(()=>{const d=Pe.url,p=d.searchParams.get("search")||"",$=d.searchParams.get("platforms")||"",N=d.searchParams.get("genres")||"",E=d.searchParams.get("tiers")||"",H=d.searchParams.get("ratingPresentation")||"",_=d.searchParams.get("ratingStory")||"",w=d.searchParams.get("ratingGameplay")||"",k=d.searchParams.get("ratingTotal")||"",P={searchQuery:p,selectedPlatforms:$?$.split(","):[],selectedGenres:N?N.split(","):[],selectedTiers:E?E.split(","):[],ratingRanges:{presentation:H?H.split(",").map(Number):[0,10],story:_?_.split(",").map(Number):[0,10],gameplay:w?w.split(",").map(Number):[0,10],total:k?k.split(",").map(Number):[0,20]}},D=JSON.stringify(P),J=JSON.stringify(y);e&&D!==J&&C.readFromURL(Pe.url.searchParams),C.readFromURL(Pe.url.searchParams)});let A=K(le([])),M=K(le([])),b=K(le([]));I(()=>{const d=C.selectedPlatforms.subscribe(N=>{L(A,N,!0)}),p=C.selectedGenres.subscribe(N=>{L(M,N,!0)}),$=C.selectedTiers.subscribe(N=>{L(b,N,!0)});return()=>{d(),p(),$()}});function B(){C.resetAllFilters(),s&&clearTimeout(s),re.writeToURLWithFilters(C)}var T=nr();Et(d=>{var p=ir();Bt.title="Gaming Tracker",g(d,p)});var R=i(T);Ja(R,{});var z=o(R,2);ar(z,{});var U=o(z,2),te=i(U),X=i(te);Qt(X,{});var u=o(X,2);{var f=d=>{var p=sr(),$=i(p),N=i($);He(N,{type:"platforms",label:"Platforms",get options(){return t(l).platforms},get selectedOptions(){return t(A)}});var E=o(N,2);He(E,{type:"genres",label:"Genres",get options(){return t(l).genres},get selectedOptions(){return t(M)}});var H=o(E,2);He(H,{type:"tiers",label:"Tiers",get options(){return t(l).tiers},get selectedOptions(){return t(b)}});var _=o(H,2);Sa(_,{});var w=o(_,2);w.__click=B;var k=o(w,2),P=i(k);P.__click=[rr];var D=i(P);{var J=ae=>{ra(ae,{size:18,class:"text-gray-600 dark:text-gray-400"})},ge=ae=>{aa(ae,{size:18,class:"text-gray-600 dark:text-gray-400"})};j(D,ae=>{t(v)==="gallery"?ae(J):ae(ge,!1)})}r(P),r(k),r($),r(p),Q(()=>Y(P,"title",t(v)==="gallery"?"Switch to table view":"Switch to gallery view")),g(d,p)};j(u,d=>{t(c)!=="tierlist"&&d(f)})}r(te),r(U);var S=o(U,2),V=i(S),q=i(V);Dt(q,()=>a.children??Vt),r(V),r(S);var m=o(S,2);Qa(m,{}),r(T),g(n,T),fe()}pe(["click"]);export{pr as component,gr as universal};
