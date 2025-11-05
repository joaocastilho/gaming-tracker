import{g as ze,h as Ct,i as Tt,T as Mt,I as pe,s as ye,l as Lt,C as St,e as dt,f as it,d as me,r as kt,b as Le,c as q,n as wt,P as st,N as nt,G as ot,a as be}from"../chunks/PG1WmJj5.js";import"../chunks/DsnmJJEf.js";import{l as Ce,p as Te,o as H,v as x,f as G,s as o,b as f,c as Me,m as F,d as l,w as e,r,a5 as ne,a as ae,t as W,e as U,n as ue,a6 as Ge,ah as Jt,x as Zt,ai as ea,a7 as Gt,a8 as ta,z as ge,y as aa,aj as ra,$ as la,ak as ia}from"../chunks/BVpkGxlo.js";import{i as E,l as he,s as xe,p as Xe}from"../chunks/Ct-dy8PW.js";import{p as Qe}from"../chunks/D27dXMuv.js";import{b as Fe,c as sa}from"../chunks/DpGvHQc7.js";import{f as z,a as de}from"../chunks/DC6fPUr-.js";import"../chunks/8pDLZIH-.js";async function na(s){return await ze.loadGames(s),{}}const Or=Object.freeze(Object.defineProperty({__proto__:null,load:na},Symbol.toStringTag,{value:"Module"}));var oa=G('<button type="button" class="clear-button svelte-yyldap" aria-label="Clear search"><span aria-hidden="true">×</span></button>'),ca=G('<div class="search-bar-container svelte-yyldap"><div class="search-bar svelte-yyldap"><span class="search-icon svelte-yyldap" aria-hidden="true">🔍</span> <input type="text" placeholder="Search games..." class="search-input svelte-yyldap" aria-label="Search games" autocomplete="off" spellcheck="false"/> <!></div></div>');function da(s,a){Te(a,!0);let t,i,d=F("");H(()=>z.searchQuery.subscribe(V=>{x(d,V,!0)})),H(()=>{t&&t.focus()});function g(S){const Z=S.target.value;i&&clearTimeout(i),i=setTimeout(()=>{z.searchQuery.set(Z),z.writeToURL()},300)}function u(){t&&(t.value="",t.focus()),z.searchQuery.set(""),z.writeToURL(),i&&clearTimeout(i)}function b(S){S.key==="Escape"&&t&&t.select()}function R(S){S.key==="Escape"&&t&&(S.preventDefault(),t.focus(),t.select())}H(()=>(document.addEventListener("keydown",R),()=>{document.removeEventListener("keydown",R)}));var D=ca(),j=l(D),L=o(l(j),2);L.__input=g,L.__keydown=b,Fe(L,S=>t=S,()=>t);var p=o(L,2);{var C=S=>{var V=oa();V.__click=u,f(S,V)};E(p,S=>{e(d)&&S(C)})}r(j),r(D),f(s,D),Me()}Ce(["input","keydown","click"]);const va=s=>Ct[s]||"bg-[#6b7280] text-[#f9fafb]",ua=s=>Tt[s]||"bg-[#6b7280] text-[#f9fafb]",ma=s=>Mt[s]||"bg-gray-600 text-white",fa=s=>{const a=new Set;return s.forEach(t=>{t.platform&&a.add(t.platform)}),Array.from(a).sort()},ga=s=>{const a=new Set;return s.forEach(t=>{t.genre&&a.add(t.genre)}),Array.from(a).sort()},ba=s=>{const a=new Set;s.forEach(d=>{d.status==="Completed"&&d.tier&&a.add(d.tier)});const t={S:"S - Masterpiece",A:"A - Amazing",B:"B - Great",C:"C - Good",D:"D - Decent",E:"E - Bad"};return Array.from(a).map(d=>t[d]).filter(Boolean).sort((d,g)=>{const u=["S - Masterpiece","A - Amazing","B - Great","C - Good","D - Decent","E - Bad"];return u.indexOf(d)-u.indexOf(g)})},pa=s=>({platforms:fa(s),genres:ga(s),tiers:ba(s)});function ya(s,a){const t=he(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["path",{d:"m15 18-6-6 6-6"}]];pe(s,xe({name:"chevron-left"},()=>t,{get iconNode(){return i},children:(d,g)=>{var u=ne(),b=ae(u);ye(b,a,"default",{}),f(d,u)},$$slots:{default:!0}}))}function ha(s,a){const t=he(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["path",{d:"m9 18 6-6-6-6"}]];pe(s,xe({name:"chevron-right"},()=>t,{get iconNode(){return i},children:(d,g)=>{var u=ne(),b=ae(u);ye(b,a,"default",{}),f(d,u)},$$slots:{default:!0}}))}function xa(s,a){const t=he(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2"}],["path",{d:"M3 9h18"}],["path",{d:"M3 15h18"}],["path",{d:"M9 3v18"}],["path",{d:"M15 3v18"}]];pe(s,xe({name:"grid-3x3"},()=>t,{get iconNode(){return i},children:(d,g)=>{var u=ne(),b=ae(u);ye(b,a,"default",{}),f(d,u)},$$slots:{default:!0}}))}function _a(s,a){const t=he(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["path",{d:"M3 5h.01"}],["path",{d:"M3 12h.01"}],["path",{d:"M3 19h.01"}],["path",{d:"M8 5h13"}],["path",{d:"M8 12h13"}],["path",{d:"M8 19h13"}]];pe(s,xe({name:"list"},()=>t,{get iconNode(){return i},children:(d,g)=>{var u=ne(),b=ae(u);ye(b,a,"default",{}),f(d,u)},$$slots:{default:!0}}))}function ka(s,a){const t=he(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21"}]];pe(s,xe({name:"monitor"},()=>t,{get iconNode(){return i},children:(d,g)=>{var u=ne(),b=ae(u);ye(b,a,"default",{}),f(d,u)},$$slots:{default:!0}}))}function wa(s,a){const t=he(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["circle",{cx:"18",cy:"5",r:"3"}],["circle",{cx:"6",cy:"12",r:"3"}],["circle",{cx:"18",cy:"19",r:"3"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49"}]];pe(s,xe({name:"share-2"},()=>t,{get iconNode(){return i},children:(d,g)=>{var u=ne(),b=ae(u);ye(b,a,"default",{}),f(d,u)},$$slots:{default:!0}}))}function Ga(s,a){const t=he(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]];pe(s,xe({name:"star"},()=>t,{get iconNode(){return i},children:(d,g)=>{var u=ne(),b=ae(u);ye(b,a,"default",{}),f(d,u)},$$slots:{default:!0}}))}function Ca(s,a){const t=he(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor"}]];pe(s,xe({name:"tag"},()=>t,{get iconNode(){return i},children:(d,g)=>{var u=ne(),b=ae(u);ye(b,a,"default",{}),f(d,u)},$$slots:{default:!0}}))}function ct(s,a){const t=he(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18"}],["path",{d:"M4 22h16"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6"}]];pe(s,xe({name:"trophy"},()=>t,{get iconNode(){return i},children:(d,g)=>{var u=ne(),b=ae(u);ye(b,a,"default",{}),f(d,u)},$$slots:{default:!0}}))}function Ta(s,a){const t=he(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const i=[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]];pe(s,xe({name:"x"},()=>t,{get iconNode(){return i},children:(d,g)=>{var u=ne(),b=ae(u);ye(b,a,"default",{}),f(d,u)},$$slots:{default:!0}}))}var Ma=G('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1uy8f65"> </span>'),La=(s,a,t)=>a(t),Sa=G('<button type="button"> </button>'),Pa=(s,a)=>{s.stopPropagation(),a()},Ra=G('<div class="filter-actions mt-3 flex justify-center svelte-1uy8f65"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),$a=G('<div class="empty-state py-2 text-center svelte-1uy8f65"><span class="text-muted-foreground text-sm"> </span></div>'),za=G('<div class="filter-options-dropdown svelte-1uy8f65"><div class="filter-options-section svelte-1uy8f65"><div class="filter-options-grid svelte-1uy8f65"></div> <!> <!></div></div>'),Da=G('<div class="filter-dropdown svelte-1uy8f65"><button><!> <span class="filter-label svelte-1uy8f65"> </span> <!></button> <!></div>');function lt(s,a){Te(a,!0);let t=Xe(a,"selectedOptions",19,()=>[]),i=F(!1),d;function g(n){const P=n.target,k=document.querySelector(".filter-options-dropdown");k&&k.contains(P)||d&&!d.contains(P)&&x(i,!1)}H(()=>{if(e(i))return document.addEventListener("click",g),()=>{document.removeEventListener("click",g)}});function u(n){a.type==="platforms"?z.togglePlatform(n):a.type==="genres"?z.toggleGenre(n):a.type==="tiers"&&z.toggleTier(n)}function b(){t().forEach(n=>{a.type==="platforms"?z.removePlatform(n):a.type==="genres"?z.removeGenre(n):a.type==="tiers"&&z.removeTier(n)})}function R(n){return a.type==="platforms"?va(n):a.type==="genres"?ua(n):a.type==="tiers"?ma(n):"bg-gray-600 text-white"}function D(){return t().length===0?"bg-surface hover:bg-accent hover:text-accent-foreground border-0":"bg-accent text-accent-foreground border-0"}function j(n){n.key==="Escape"?(x(i,!1),n.preventDefault()):(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),x(i,!e(i)))}function L(){return{"aria-expanded":e(i),"aria-haspopup":"listbox","aria-label":`Filter by ${a.label.toLowerCase()}`}}var p=Da(),C=l(p),S=()=>x(i,!e(i));Lt(C,(n,P,k)=>({type:"button",class:`filter-button ${n??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:S,onkeydown:j,...P,[St]:k}),[D,L,()=>({selected:t().length>0})],void 0,"svelte-1uy8f65");var V=l(C);{var Z=n=>{ka(n,{size:16,class:"text-gray-600 dark:text-gray-400"})},oe=n=>{var P=ne(),k=ae(P);{var c=w=>{Ca(w,{size:16,class:"text-gray-600 dark:text-gray-400"})},v=w=>{var B=ne(),Q=ae(B);{var $=M=>{ct(M,{size:16,class:"text-gray-600 dark:text-gray-400"})};E(Q,M=>{a.type==="tiers"&&M($)},!0)}f(w,B)};E(k,w=>{a.type==="genres"?w(c):w(v,!1)},!0)}f(n,P)};E(V,n=>{a.type==="platforms"?n(Z):n(oe,!1)})}var re=o(V,2),le=l(re);r(re);var T=o(re,2);{var N=n=>{var P=Ma(),k=l(P,!0);r(P),W(()=>U(k,t().length)),f(n,P)};E(T,n=>{t().length>0&&n(N)})}r(C);var K=o(C,2);{var h=n=>{var P=za(),k=l(P),c=l(k);dt(c,20,()=>a.options,$=>$,($,M)=>{var O=Sa();O.__click=[La,u,M];var J=l(O,!0);r(O),W((Y,_e,ie)=>{me(O,1,`filter-option-item ${Y??""} ${_e??""}`,"svelte-1uy8f65"),U(J,ie)},[()=>R(M),()=>t().includes(M)?"selected":"",()=>a.type==="tiers"?it(M):M]),f($,O)}),r(c);var v=o(c,2);{var w=$=>{var M=Ra(),O=l(M);O.__click=[Pa,b],r(M),f($,M)};E(v,$=>{t().length>0&&$(w)})}var B=o(v,2);{var Q=$=>{var M=$a(),O=l(M),J=l(O);r(O),r(M),W(Y=>U(J,`No ${Y??""} available`),[()=>a.label.toLowerCase()]),f($,M)};E(B,$=>{a.options.length===0&&$(Q)})}r(k),r(P),f(n,P)};E(K,n=>{e(i)&&n(h)})}r(p),Fe(p,n=>d=n,()=>d),W(()=>U(le,`Filter by ${a.label??""}`)),f(s,p),Me()}Ce(["click"]);function Ea(s,a,t){const i=s.target,d=parseInt(i.value);a(d,e(t),!0)}function Na(s,a,t){const i=s.target,d=parseInt(i.value);a(e(t),d,!1)}var Aa=G('<span class="filter-icon svelte-1ugjrx4" aria-label="Rating filter">🏆</span>'),ja=(s,a)=>{s.stopPropagation(),a()},Oa=G('<button type="button" class="reset-button svelte-1ugjrx4" title="Reset to default range">Reset</button>'),Fa=(s,a)=>a(s,"min"),Ba=(s,a)=>a(s,"max"),Ia=G('<div class="rating-slider svelte-1ugjrx4"><div class="slider-header svelte-1ugjrx4"><span class="slider-label svelte-1ugjrx4"><!> </span> <!></div> <div class="slider-container svelte-1ugjrx4"><div class="dual-slider-row svelte-1ugjrx4"><div class="slider-track svelte-1ugjrx4" role="application" aria-label="Rating range slider track"><div class="slider-fill svelte-1ugjrx4"><div class="drag-handle drag-handle-left svelte-1ugjrx4" role="button" tabindex="0"></div> <div class="drag-handle drag-handle-right svelte-1ugjrx4" role="button" tabindex="0"></div></div> <input type="range" class="slider-thumb slider-thumb-min svelte-1ugjrx4"/> <input type="range" class="slider-thumb slider-thumb-max svelte-1ugjrx4"/></div></div></div></div>');function Va(s,a){Te(a,!0);let t=Xe(a,"step",3,1),i=Xe(a,"disabled",3,!1),d=Xe(a,"onRangeChange",3,()=>{});function g(){const _=a.label.toLowerCase();return _.includes("presentation")?st:_.includes("story")?nt:_.includes("gameplay")?ot:null}function u(){const _=a.label.toLowerCase();return _.includes("presentation")?"text-cyan-500":_.includes("story")?"text-amber-600":_.includes("gameplay")?"text-pink-500":"text-gray-600"}let b=F(ue(a.minValue)),R=F(ue(a.maxValue)),D,j=F(!1),L=F(null);H(()=>{x(b,a.minValue,!0),x(R,a.maxValue,!0)});function p(_,I,se){return Math.min(Math.max(_,I),se)}function C(_,I,se=!1){if(i())return;let ee=p(_,a.minLimit,a.maxLimit),X=p(I,a.minLimit,a.maxLimit);se?ee=Math.min(ee,X):X=Math.max(X,ee),ee=Math.round(ee/t())*t(),X=Math.round(X/t())*t(),x(b,ee,!0),x(R,X,!0),d()(ee,X)}function S(){C(a.minLimit,a.maxLimit)}function V(_,I){i()||(x(L,I,!0),x(j,!0),document.addEventListener("mousemove",oe),document.addEventListener("mouseup",re),_.preventDefault())}function Z(_){if(i()||!D)return;const I=D.getBoundingClientRect(),se=_.clientX-I.left,ee=I.width,X=se/ee,ve=le()/100,ce=T()/100,Se=ve,De=ce;if(X>=Se&&X<=De){const Ee=Math.abs(X-ve),Ne=Math.abs(X-ce);x(L,Ee<=Ne?"min":"max",!0),x(j,!0),document.addEventListener("mousemove",oe),document.addEventListener("mouseup",re),_.preventDefault()}}function oe(_){if(!e(j)||!D||i())return;const I=D.getBoundingClientRect(),se=_.clientX-I.left,ee=I.width,X=Math.max(0,Math.min(1,se/ee)),ve=Math.round((X*(a.maxLimit-a.minLimit)+a.minLimit)/t())*t(),ce=p(ve,a.minLimit,a.maxLimit);e(L)==="min"?C(ce,e(R),!0):e(L)==="max"&&C(e(b),ce,!1)}function re(){x(j,!1),x(L,null),document.removeEventListener("mousemove",oe),document.removeEventListener("mouseup",re)}function le(){return(e(b)-a.minLimit)/(a.maxLimit-a.minLimit)*100}function T(){return(e(R)-a.minLimit)/(a.maxLimit-a.minLimit)*100}function N(){return e(b)===a.minLimit&&e(R)===a.maxLimit}function K(){return"#6b7280"}var h=Ia(),n=l(h),P=l(n),k=l(P);{var c=_=>{const I=Ge(g);var se=ne(),ee=ae(se);{let X=Ge(u);sa(ee,()=>e(I),(ve,ce)=>{ce(ve,{get class(){return`filter-icon ${e(X)??""}`},get"aria-label"(){return`${a.label??""} filter`},size:20})})}f(_,se)},v=_=>{var I=Aa();f(_,I)};E(k,_=>{g()?_(c):_(v,!1)})}var w=o(k);r(P);var B=o(P,2);{var Q=_=>{var I=Oa();I.__click=[ja,S],W(()=>I.disabled=i()),f(_,I)};E(B,_=>{N()||_(Q)})}r(n);var $=o(n,2),M=l($),O=l(M);O.__mousedown=Z;var J=l(O),Y=l(J);Y.__mousedown=[Fa,V];var _e=o(Y,2);_e.__mousedown=[Ba,V],r(J);var ie=o(J,2);kt(ie),ie.__input=[Ea,C,R];var fe=o(ie,2);kt(fe),fe.__input=[Na,C,b],r(O),r(M),r($),Fe($,_=>D=_,()=>D),r(h),W((_,I,se,ee,X,ve,ce,Se,De,Ee)=>{Le(h,`--min-color: ${_??""}; --max-color: ${I??""}`),U(w,` ${a.label??""}
			${e(b)??""} - ${e(R)??""}`),Le(J,`left: ${se??""}%; width: ${ee??""}%`),Le(Y,`background-color: ${X??""}`),q(Y,"aria-label",`Drag to adjust minimum ${ve??""} value`),Le(_e,`background-color: ${ce??""}`),q(_e,"aria-label",`Drag to adjust maximum ${Se??""} value`),q(ie,"min",a.minLimit),q(ie,"max",a.maxLimit),q(ie,"step",t()),wt(ie,e(b)),ie.disabled=i(),q(ie,"aria-label",`Minimum ${De??""} rating`),q(fe,"min",a.minLimit),q(fe,"max",a.maxLimit),q(fe,"step",t()),wt(fe,e(R)),fe.disabled=i(),q(fe,"aria-label",`Maximum ${Ee??""} rating`)},[K,K,le,()=>T()-le(),K,()=>a.label.toLowerCase(),K,()=>a.label.toLowerCase(),()=>a.label.toLowerCase(),()=>a.label.toLowerCase()]),f(s,h),Me()}Ce(["click","mousedown","input"]);var Ua=G('<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs svelte-1vf89kc"> </span>'),Ha=G('<div class="rating-slider-item svelte-1vf89kc"><!></div>'),Ka=(s,a)=>{s.stopPropagation(),a()},Qa=G('<div class="filter-actions mt-4 flex justify-center svelte-1vf89kc"><button type="button" class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300">Clear all</button></div>'),Xa=G('<div class="ratings-filter-dropdown svelte-1vf89kc"><div class="filter-options-section svelte-1vf89kc"><div class="filter-options-grid svelte-1vf89kc"></div> <!></div></div>'),Ya=G('<div class="ratings-filter svelte-1vf89kc"><button><!> <span class="filter-label svelte-1vf89kc">Filter by Ratings</span> <!></button> <!></div>');function qa(s,a){Te(a,!0);const t={presentation:{label:"Presentation",maxValue:10},story:{label:"Story",maxValue:10},gameplay:{label:"Gameplay",maxValue:10},total:{label:"Score",maxValue:20}};let i=F(!1),d,g=F(ue({presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}));H(()=>z.ratingRanges.subscribe(N=>{x(g,N,!0)}));function u(T){const N=T.target,K=document.querySelector(".ratings-filter-dropdown");K&&K.contains(N)||d&&!d.contains(N)&&x(i,!1)}H(()=>{if(e(i))return document.addEventListener("click",u),()=>{document.removeEventListener("click",u)}});function b(){z.setRatingRange("presentation",0,10),z.setRatingRange("story",0,10),z.setRatingRange("gameplay",0,10),z.setRatingRange("total",0,20)}function R(){return e(g).presentation[0]>0||e(g).presentation[1]<10||e(g).story[0]>0||e(g).story[1]<10||e(g).gameplay[0]>0||e(g).gameplay[1]<10||e(g).total[0]>0||e(g).total[1]<20}function D(){return R()?"bg-accent text-accent-foreground border-0":"bg-surface hover:bg-accent hover:text-accent-foreground border-0"}function j(T){T.key==="Escape"?(x(i,!1),T.preventDefault()):(T.key==="Enter"||T.key===" ")&&(T.preventDefault(),x(i,!e(i)))}function L(){return{"aria-expanded":e(i),"aria-haspopup":"listbox","aria-label":"Filter by ratings"}}var p=Ya(),C=l(p),S=()=>x(i,!e(i));Lt(C,(T,N,K)=>({type:"button",class:`filter-button ${T??""} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors`,onclick:S,onkeydown:j,...N,[St]:K}),[D,L,()=>({selected:R()})],void 0,"svelte-1vf89kc");var V=l(C);Ga(V,{size:16,class:"text-gray-600 dark:text-gray-400"});var Z=o(V,4);{var oe=T=>{var N=Ua(),K=l(N,!0);r(N),W(h=>U(K,h),[()=>[e(g).presentation,e(g).story,e(g).gameplay,e(g).total].filter(([h,n],P)=>{const k=[[0,10],[0,10],[0,10],[0,20]];return h>k[P][0]||n<k[P][1]}).length]),f(T,N)};E(Z,T=>{R()&&T(oe)})}r(C);var re=o(C,2);{var le=T=>{var N=Xa(),K=l(N),h=l(K);dt(h,21,()=>Object.entries(t),([k,c])=>k,(k,c)=>{var v=Ge(()=>Jt(e(c),2));let w=()=>e(v)[0],B=()=>e(v)[1];const Q=Ge(w),$=Ge(()=>e(g)[e(Q)]);var M=Ha(),O=l(M);Va(O,{get label(){return B().label},get minValue(){return e($)[0]},get maxValue(){return e($)[1]},step:1,minLimit:0,get maxLimit(){return B().maxValue},onRangeChange:(J,Y)=>z.setRatingRange(e(Q),J,Y)}),r(M),f(k,M)}),r(h);var n=o(h,2);{var P=k=>{var c=Qa(),v=l(c);v.__click=[Ka,b],r(c),f(k,c)};E(n,k=>{R()&&k(P)})}r(K),r(N),f(T,N)};E(re,T=>{e(i)&&T(le)})}r(p),Fe(p,T=>d=T,()=>d),f(s,p),Me()}Ce(["click"]);function Wa(s,a){s.target===e(a)&&be.closeModal()}function Ja(s){(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),be.closeModal())}async function Za(s,a,t){if(e(a).activeGame)try{const i=new URL(window.location.href),d=e(a).activeGame.title.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim().replace(/^-|-$/g,"");i.searchParams.set("game",d),await navigator.clipboard.writeText(i.toString()),x(t,"Copied!"),setTimeout(()=>{x(t,"")},2e3)}catch(i){console.warn("Failed to copy to clipboard:",i),x(t,"Failed"),setTimeout(()=>{x(t,"")},2e3)}}var er=G('<button class="absolute top-1/2 left-2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70 svelte-1rbkl0e" aria-label="Previous game"><!></button>'),tr=G('<button class="absolute top-1/2 right-2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70 svelte-1rbkl0e" aria-label="Next game"><!></button>'),ar=()=>be.closeModal(),rr=G('<div class="image-placeholder svelte-1rbkl0e"></div>'),lr=G('<div class="absolute top-4 right-4 rounded-md bg-blue-600 px-3 py-1 text-sm font-semibold text-white svelte-1rbkl0e">👥 Co-op</div>'),ir=G('<br class="svelte-1rbkl0e"/> <span class="font-semibold svelte-1rbkl0e" style="font-size: 1.2rem; line-height: 1.2; color: var(--color-text-secondary);"> </span>',1),sr=G('<span style="color: var(--color-text-primary)" class="text-sm font-medium text-gray-700 dark:text-gray-200 svelte-1rbkl0e"> </span>'),nr=G('<span class="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white svelte-1rbkl0e">Co-op</span>'),or=G("<span> </span>"),cr=G('<div class="svelte-1rbkl0e"><div class="mb-1 text-sm svelte-1rbkl0e" style="color: var(--color-text-tertiary);">Hours Played</div> <div class="font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);"> </div></div>'),dr=G('<div class="svelte-1rbkl0e"><div class="mb-1 text-sm svelte-1rbkl0e" style="color: var(--color-text-tertiary);">Time to Beat</div> <div class="font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);"> </div></div>'),vr=G('<div class="mt-6 rounded-lg border border-blue-200 from-blue-50 to-purple-50 p-4 dark:border-blue-800 dark:from-blue-900/80 dark:to-purple-900/80 svelte-1rbkl0e"><div class="flex items-center justify-center gap-2 svelte-1rbkl0e"><!> <span class="text-lg font-bold svelte-1rbkl0e" style="color: var(--color-text-primary);"> </span></div></div>'),ur=G('<div class="space-y-4 svelte-1rbkl0e"><h3 class="mb-4 text-xl font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);">Ratings</h3> <div class="flex items-center gap-3 svelte-1rbkl0e"><div class="flex min-w-0 flex-1 items-center gap-2 svelte-1rbkl0e"><!> <span class="text-sm font-medium svelte-1rbkl0e" style="color: var(--color-text-secondary);">Presentation</span></div> <span class="min-w-0 text-sm font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);"> </span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 svelte-1rbkl0e"><div></div></div></div> <div class="flex items-center gap-3 svelte-1rbkl0e"><div class="flex min-w-0 flex-1 items-center gap-2 svelte-1rbkl0e"><!> <span class="text-sm font-medium svelte-1rbkl0e" style="color: var(--color-text-secondary);">Story</span></div> <span class="min-w-0 text-sm font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);"> </span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 svelte-1rbkl0e"><div></div></div></div> <div class="flex items-center gap-3 svelte-1rbkl0e"><div class="flex min-w-0 flex-1 items-center gap-2 svelte-1rbkl0e"><!> <span class="text-sm font-medium svelte-1rbkl0e" style="color: var(--color-text-secondary);">Gameplay</span></div> <span class="min-w-0 text-sm font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);"> </span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 svelte-1rbkl0e"><div></div></div></div> <!></div>'),mr=G('<div class="space-y-4 svelte-1rbkl0e"><h3 class="mb-4 text-xl font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);">Ratings</h3> <div class="flex items-center gap-3 svelte-1rbkl0e"><div class="flex min-w-0 flex-1 items-center gap-2 svelte-1rbkl0e"><!> <span class="text-sm font-medium svelte-1rbkl0e" style="color: var(--color-text-secondary);">Presentation</span></div> <span class="min-w-0 text-sm font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);">Not rated</span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 svelte-1rbkl0e"><div class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300 svelte-1rbkl0e" style="width: 0%"></div></div></div> <div class="flex items-center gap-3 svelte-1rbkl0e"><div class="flex min-w-0 flex-1 items-center gap-2 svelte-1rbkl0e"><!> <span class="text-sm font-medium svelte-1rbkl0e" style="color: var(--color-text-secondary);">Story</span></div> <span class="min-w-0 text-sm font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);">Not rated</span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 svelte-1rbkl0e"><div class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300 svelte-1rbkl0e" style="width: 0%"></div></div></div> <div class="flex items-center gap-3 svelte-1rbkl0e"><div class="flex min-w-0 flex-1 items-center gap-2 svelte-1rbkl0e"><!> <span class="text-sm font-medium svelte-1rbkl0e" style="color: var(--color-text-secondary);">Gameplay</span></div> <span class="min-w-0 text-sm font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);">Not rated</span> <div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 svelte-1rbkl0e"><div class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300 svelte-1rbkl0e" style="width: 0%"></div></div></div> <div class="mt-6 rounded-lg border border-gray-200 from-gray-50 to-gray-50 p-4 dark:border-gray-700 svelte-1rbkl0e"><div class="flex items-center justify-center gap-2 svelte-1rbkl0e"><!> <span class="text-lg font-bold svelte-1rbkl0e" style="color: var(--color-text-primary);">Game to be completed</span></div></div></div>'),fr=G('<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-1 backdrop-blur-[8px] svelte-1rbkl0e" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="modal-title"><!> <!> <button class="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 svelte-1rbkl0e" aria-label="Close modal"><!></button> <div class="relative h-[600px] w-full max-w-4xl rounded-xl shadow-2xl svelte-1rbkl0e" style="background-color: var(--color-surface);"><div class="grid grid-cols-1 gap-0 lg:grid-cols-[400px_1fr] svelte-1rbkl0e"><div class="relative overflow-hidden rounded-l-lg svelte-1rbkl0e"><!> <img style="width: 400px; height: 600px;" loading="lazy"/> <!></div> <div class="max-h-[60vh] overflow-y-auto pt-4 pr-6 pb-6 pl-6 lg:pt-6 lg:pr-8 lg:pb-8 lg:pl-8 svelte-1rbkl0e"><div class="mb-4 flex items-start justify-between gap-4 svelte-1rbkl0e"><h1 id="modal-title" class="flex flex-1 flex-col justify-center text-3xl font-bold svelte-1rbkl0e" style="height: 65px; color: var(--color-text-primary);"> <!></h1> <button class="flex h-10 cursor-pointer items-center justify-center rounded-full bg-transparent px-3 transition-colors hover:bg-black/5 dark:bg-transparent dark:hover:bg-black/20 svelte-1rbkl0e" aria-label="Share game" style="min-width: 40px;"><!></button></div> <div class="mb-6 flex items-center justify-between svelte-1rbkl0e"><div class="flex flex-wrap gap-2 svelte-1rbkl0e"><span> </span> <span> </span> <!></div> <!></div> <div class="mb-8 grid grid-cols-2 gap-4 svelte-1rbkl0e"><div class="svelte-1rbkl0e"><div class="mb-1 text-sm svelte-1rbkl0e" style="color: var(--color-text-tertiary);">Year Released</div> <div class="font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);"> </div></div> <!> <div class="svelte-1rbkl0e"><div class="mb-1 text-sm svelte-1rbkl0e" style="color: var(--color-text-tertiary);">Finished Date</div> <div class="font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);"> </div></div> <div class="svelte-1rbkl0e"><div class="mb-1 text-sm svelte-1rbkl0e" style="color: var(--color-text-tertiary);">Co-op</div> <div class="font-semibold svelte-1rbkl0e" style="color: var(--color-text-primary);"> </div></div></div> <!></div></div></div></div>');function gr(s,a){Te(a,!0);let t=F(ue(be.getState())),i=F(ue([])),d=F("all"),g=F(ue({filteredGames:[],totalCount:0,completedCount:0,plannedCount:0}));const u=z.createFilteredGamesStore(ze);H(()=>be.subscribe(v=>{x(t,v,!0),be.writeToURL()})),H(()=>ze.subscribe(v=>{x(i,v,!0)})),H(()=>u.subscribe(v=>{x(g,v,!0)})),H(()=>de.activeTab.subscribe(v=>{x(d,v,!0)}));let b=F(void 0),R=F(!1),D=F(!1),j=F(""),L=Ge(()=>()=>{if(!e(t).activeGame?.title)return{mainTitle:"",subtitle:null};const c=e(t).activeGame.title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);return c?{mainTitle:c[1].trim(),subtitle:`(${c[2]})`}:{mainTitle:e(t).activeGame.title,subtitle:null}}),p=Ge(()=>()=>{const c=e(g).filteredGames;switch(e(d)){case"all":return c.toSorted((v,w)=>v.title.localeCompare(w.title));case"completed":return c.filter(v=>v.status==="Completed").toSorted((v,w)=>!v.finishedDate&&!w.finishedDate?0:v.finishedDate?w.finishedDate?new Date(w.finishedDate).getTime()-new Date(v.finishedDate).getTime():-1:1);case"planned":return c.filter(v=>v.status==="Planned").toSorted((v,w)=>v.title.localeCompare(w.title));case"tierlist":{const v={S:"S - Masterpiece",A:"A - Amazing",B:"B - Great",C:"C - Good",D:"D - Decent",E:"E - Bad"},w=["S - Masterpiece","A - Amazing","B - Great","C - Good","D - Decent","E - Bad"];return e(i).filter(B=>B.status==="Completed"&&B.tier).toSorted((B,Q)=>{const $=v[B.tier]||B.tier,M=v[Q.tier]||Q.tier,O=w.indexOf($),J=w.indexOf(M);return O!==J?O-J:B.title.localeCompare(Q.title)})}default:return c.toSorted((v,w)=>v.title.localeCompare(w.title))}}),C=Ge(()=>()=>e(t).activeGame?e(p)().findIndex(c=>c.id===e(t).activeGame?.id):-1);function S(){const c=e(C)(),v=e(p)();if(c>0){const w=v[c-1];be.openViewModal(w)}}function V(){const c=e(C)(),v=e(p)();if(c<v.length-1){const w=v[c+1];be.openViewModal(w)}}function Z(c){c.key==="Escape"?be.closeModal():c.key==="ArrowLeft"?(c.preventDefault(),S()):c.key==="ArrowRight"&&(c.preventDefault(),V())}function oe(){x(R,!0),x(D,!1)}function re(){x(R,!1),x(D,!0)}function le(c){if(!c)return"Not completed";try{return new Date(c).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}catch{return"Invalid date"}}function T(c){if(!c)return"bg-gray-400";const v=it(c);return Mt[v]||"bg-gray-400"}function N(c){return Ct[c]||"bg-gray-600 text-white"}function K(c){return Tt[c]||"bg-gray-600 text-white"}function h(c){return c>=8?"bg-gradient-to-r from-[#388E3C] to-[#4CAF50]":c>=6?"bg-gradient-to-r from-[#A4D454] to-[#8BC34A]":c>=5?"bg-gradient-to-r from-[#FFC107] to-[#FFEB3B]":c>=3?"bg-gradient-to-r from-[#FF832B] to-[#FF9800]":"bg-gradient-to-r from-[#D32F2F] to-[#F44336]"}Zt(()=>{document.addEventListener("keydown",Z)}),ea(()=>{document.removeEventListener("keydown",Z)});var n=ne(),P=ae(n);{var k=c=>{var v=fr();v.__click=[Wa,b],v.__keydown=[Ja];var w=l(v);{var B=m=>{var y=er();y.__click=S;var A=l(y);ya(A,{size:32}),r(y),f(m,y)};E(w,m=>{e(C)()>0&&m(B)})}var Q=o(w,2);{var $=m=>{var y=tr();y.__click=V;var A=l(y);ha(A,{size:32}),r(y),f(m,y)};E(Q,m=>{e(C)()<e(p)().length-1&&m($)})}var M=o(Q,2);M.__click=[ar];var O=l(M);Ta(O,{size:20,class:"text-gray-600 dark:text-gray-300"}),r(M);var J=o(M,2),Y=l(J),_e=l(Y),ie=l(_e);{var fe=m=>{var y=rr();f(m,y)};E(ie,m=>{!e(R)&&!e(D)&&m(fe)})}var _=o(ie,2);let I;var se=o(_,2);{var ee=m=>{var y=lr();f(m,y)};E(se,m=>{e(t).activeGame.coOp==="Yes"&&m(ee)})}r(_e);var X=o(_e,2),ve=l(X),ce=l(ve),Se=l(ce),De=o(Se);{var Ee=m=>{var y=ir(),A=o(ae(y),2),te=l(A,!0);r(A),W(ke=>U(te,ke),[()=>e(L)().subtitle]),f(m,y)};E(De,m=>{e(L)().subtitle&&m(Ee)})}r(ce);var Ne=o(ce,2);Ne.__click=[Za,t,j];var Pt=l(Ne);{var Rt=m=>{var y=sr(),A=l(y,!0);r(y),W(()=>U(A,e(j))),f(m,y)},$t=m=>{wa(m,{size:18,style:"color: var(--color-text-primary)",class:"text-gray-700 dark:text-gray-200"})};E(Pt,m=>{e(j)?m(Rt):m($t,!1)})}r(Ne),r(ve);var Ye=o(ve,2),qe=l(Ye),Be=l(qe),zt=l(Be,!0);r(Be);var Ie=o(Be,2),Dt=l(Ie,!0);r(Ie);var Et=o(Ie,2);{var Nt=m=>{var y=nr();f(m,y)};E(Et,m=>{e(t).activeGame.coOp==="Yes"&&m(Nt)})}r(qe);var At=o(qe,2);{var jt=m=>{var y=or(),A=l(y,!0);r(y),W((te,ke)=>{me(y,1,`rounded-md px-3 py-1 text-sm font-semibold text-white ${te??""}`,"svelte-1rbkl0e"),U(A,ke)},[()=>T(e(t).activeGame.tier),()=>it(e(t).activeGame.tier)]),f(m,y)};E(At,m=>{e(t).activeGame.tier&&m(jt)})}r(Ye);var We=o(Ye,2),Je=l(We),vt=o(l(Je),2),Ot=l(vt,!0);r(vt),r(Je);var ut=o(Je,2);{var Ft=m=>{var y=cr(),A=o(l(y),2),te=l(A,!0);r(A),r(y),W(()=>U(te,e(t).activeGame.hoursPlayed||"Not completed")),f(m,y)},Bt=m=>{var y=dr(),A=o(l(y),2),te=l(A,!0);r(A),r(y),W(()=>U(te,e(t).activeGame.timeToBeat)),f(m,y)};E(ut,m=>{e(t).activeGame.status==="Completed"?m(Ft):m(Bt,!1)})}var Ze=o(ut,2),mt=o(l(Ze),2),It=l(mt,!0);r(mt),r(Ze);var ft=o(Ze,2),gt=o(l(ft),2),Vt=l(gt,!0);r(gt),r(ft),r(We);var Ut=o(We,2);{var Ht=m=>{var y=ur(),A=o(l(y),2),te=l(A),ke=l(te);st(ke,{size:20,class:"flex-shrink-0 text-cyan-500"}),ge(2),r(te);var we=o(te,2),Ve=l(we);r(we);var Ue=o(we,2),Pe=l(Ue);r(Ue),r(A);var Re=o(A,2),Ae=l(Re),He=l(Ae);nt(He,{size:20,class:"flex-shrink-0 text-amber-600"}),ge(2),r(Ae);var $e=o(Ae,2),et=l($e);r($e);var bt=o($e,2),pt=l(bt);r(bt),r(Re);var tt=o(Re,2),at=l(tt),Qt=l(at);ot(Qt,{size:20,class:"flex-shrink-0 text-pink-500"}),ge(2),r(at);var rt=o(at,2),Xt=l(rt);r(rt);var yt=o(rt,2),ht=l(yt);r(yt),r(tt);var Yt=o(tt,2);{var qt=je=>{var Oe=vr(),Ke=l(Oe),xt=l(Ke);ct(xt,{size:24,class:"text-yellow-500"});var _t=o(xt,2),Wt=l(_t);r(_t),r(Ke),r(Oe),W(()=>U(Wt,`Total Score: ${e(t).activeGame.score??""}/20`)),f(je,Oe)};E(Yt,je=>{e(t).activeGame.score!==null&&je(qt)})}r(y),W((je,Oe,Ke)=>{U(Ve,`${e(t).activeGame.ratingPresentation??""}/10`),me(Pe,1,`h-2 rounded-full ${je??""} transition-all duration-300`,"svelte-1rbkl0e"),Le(Pe,`width: ${e(t).activeGame.ratingPresentation*10}%`),U(et,`${e(t).activeGame.ratingStory??""}/10`),me(pt,1,`h-2 rounded-full ${Oe??""} transition-all duration-300`,"svelte-1rbkl0e"),Le(pt,`width: ${e(t).activeGame.ratingStory*10}%`),U(Xt,`${e(t).activeGame.ratingGameplay??""}/10`),me(ht,1,`h-2 rounded-full ${Ke??""} transition-all duration-300`,"svelte-1rbkl0e"),Le(ht,`width: ${e(t).activeGame.ratingGameplay*10}%`)},[()=>h(e(t).activeGame.ratingPresentation),()=>h(e(t).activeGame.ratingStory),()=>h(e(t).activeGame.ratingGameplay)]),f(m,y)},Kt=m=>{var y=mr(),A=o(l(y),2),te=l(A),ke=l(te);st(ke,{size:20,class:"flex-shrink-0 text-cyan-500"}),ge(2),r(te),ge(4),r(A);var we=o(A,2),Ve=l(we),Ue=l(Ve);nt(Ue,{size:20,class:"flex-shrink-0 text-amber-600"}),ge(2),r(Ve),ge(4),r(we);var Pe=o(we,2),Re=l(Pe),Ae=l(Re);ot(Ae,{size:20,class:"flex-shrink-0 text-pink-500"}),ge(2),r(Re),ge(4),r(Pe);var He=o(Pe,2),$e=l(He),et=l($e);ct(et,{size:24,class:"text-gray-400"}),ge(2),r($e),r(He),r(y),f(m,y)};E(Ut,m=>{e(t).activeGame.status==="Completed"&&e(t).activeGame.ratingPresentation!==null&&e(t).activeGame.ratingStory!==null&&e(t).activeGame.ratingGameplay!==null?m(Ht):m(Kt,!1)})}r(X),r(Y),r(J),r(v),Fe(v,m=>x(b,m),()=>e(b)),W((m,y,A,te,ke,we)=>{q(_,"src",m),q(_,"alt",`${e(t).activeGame.title??""} cover`),I=me(_,1,"h-full w-full object-cover svelte-1rbkl0e",null,I,y),U(Se,`${A??""} `),me(Be,1,`rounded-md px-3 py-1 text-sm font-medium text-white ${te??""}`,"svelte-1rbkl0e"),U(zt,e(t).activeGame.platform),me(Ie,1,`rounded-md px-3 py-1 text-sm font-medium text-white ${ke??""}`,"svelte-1rbkl0e"),U(Dt,e(t).activeGame.genre),U(Ot,e(t).activeGame.year),U(It,we),U(Vt,e(t).activeGame.coOp==="Yes"?"Yes":"No")},[()=>e(t).activeGame.coverImage.replace(".webp","-detail.webp"),()=>({loaded:e(R),error:e(D)}),()=>e(L)().mainTitle,()=>N(e(t).activeGame.platform),()=>K(e(t).activeGame.genre),()=>le(e(t).activeGame.finishedDate)]),Gt("load",_,oe),Gt("error",_,re),ta(_),f(c,v)};E(P,c=>{e(t).isOpen&&e(t).activeGame&&e(t).mode==="view"&&c(k)})}f(s,n),Me()}Ce(["click","keydown"]);function br(){de.toggleTheme()}var pr=G('<button type="button" class="theme-toggle svelte-1cmi4dh"><div class="icon-container svelte-1cmi4dh"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></div></button>');function yr(s,a){Te(a,!0);let t=F(ue(typeof document<"u"&&document.documentElement.classList.contains("light")?"light":"dark"));H(()=>de.theme.subscribe(j=>{x(t,j,!0)}));var i=pr();i.__click=[br];var d=l(i),g=l(d);let u;var b=o(g,2);let R;r(d),r(i),W((D,j)=>{q(i,"aria-label",e(t)==="dark"?"Switch to light mode":"Switch to dark mode"),q(i,"title",e(t)==="dark"?"Switch to light mode":"Switch to dark mode"),u=me(g,0,"sun-icon svelte-1cmi4dh",null,u,D),R=me(b,0,"moon-icon svelte-1cmi4dh",null,R,j)},[()=>({visible:e(t)==="light",hidden:e(t)==="dark"}),()=>({visible:e(t)==="dark",hidden:e(t)==="light"})]),f(s,i),Me()}Ce(["click"]);function hr(){z.resetAllFilters(),de.setActiveTab("all"),typeof window<"u"&&window.location&&window.history.replaceState(null,"",window.location.pathname+window.location.search),typeof window<"u"&&window.scrollTo({top:0,behavior:"smooth"})}var xr=G('<header class="header svelte-1elxaub"><div class="header-background svelte-1elxaub"></div> <div class="header-content container mx-auto px-6 svelte-1elxaub"><div class="header-left svelte-1elxaub"><button class="logo svelte-1elxaub" aria-label="Go to homepage and reset all filters"><picture class="logo-image svelte-1elxaub"><source srcset="logo.webp" type="image/webp"/> <img src="logo.png" alt="Gaming Tracker Logo"/></picture></button></div> <div class="header-right"><!></div></div></header>');function _r(s,a){Te(a,!0),H(()=>de.theme.subscribe(()=>{}));var t=xr(),i=o(l(t),2),d=l(i),g=l(d);g.__click=[hr],r(d);var u=o(d,2),b=l(u);yr(b,{}),r(u),r(i),r(t),f(s,t),Me()}Ce(["click"]);var kr=(s,a,t)=>a(e(t)),wr=G('<span class="tab-count svelte-12wudpi"> </span>'),Gr=G('<li class="tab-item svelte-12wudpi" role="presentation"><button type="button" role="tab" aria-controls="main-content"><span class="tab-label svelte-12wudpi"> </span> <!></button></li>'),Cr=G('<!> <nav class="navigation-tabs svelte-12wudpi" aria-label="Game navigation"><ul class="tabs-list svelte-12wudpi" role="tablist"></ul></nav>',1);function Tr(s,a){Te(a,!0);let t=F("all"),i=F(ue({total:0,planned:0,completed:0}));const d=z.createFilteredGamesStore(ze);H(()=>de.activeTab.subscribe(p=>{x(t,p,!0)})),H(()=>d.subscribe(p=>{x(i,{total:p.totalCount,planned:p.plannedCount,completed:p.completedCount},!0)})),H(()=>{if(typeof window<"u"){const L=localStorage.getItem("gaming-tracker-active-tab"),p=window.location.hash.replace("#","");let C=L||"all";p==="completed"?C="completed":p==="planned"?C="planned":p==="tierlist"?C="tierlist":p===""&&(C=L||"all"),C!==e(t)&&de.activeTab.set(C)}});const g=Ge(()=>[{id:"all",label:"Games",route:"/",count:e(i).total},{id:"completed",label:"Completed",route:"completed",count:e(i).completed},{id:"planned",label:"Planned",route:"planned",count:e(i).planned},{id:"tierlist",label:"Tier List",route:"tierlist",count:null}]);function u(L){if(L.id!==e(t)&&(de.activeTab.set(L.id),typeof window<"u"&&window.location)){const p=L.id==="all"?"":`#${L.id}`;window.history.replaceState(null,"",`${window.location.pathname}${window.location.search}${p}`)}}var b=Cr(),R=ae(b);_r(R,{});var D=o(R,2),j=l(D);dt(j,21,()=>e(g),L=>L.id,(L,p)=>{var C=Gr(),S=l(C);let V;S.__click=[kr,u,p];var Z=l(S),oe=l(Z,!0);r(Z);var re=o(Z,2);{var le=T=>{var N=wr(),K=l(N);r(N),W(()=>{q(N,"aria-label",`(${e(p).count??""} games)`),U(K,`(${e(p).count??""})`)}),f(T,N)};E(re,T=>{e(p).count!==null&&T(le)})}r(S),r(C),W(T=>{V=me(S,1,"tab-button svelte-12wudpi",null,V,T),q(S,"aria-selected",e(t)===e(p).id),q(S,"tabindex",e(t)===e(p).id?0:-1),q(S,"title",`Navigate to ${e(p).label??""} games`),U(oe,e(p).label)},[()=>({active:e(t)===e(p).id})]),f(L,C)}),r(j),r(D),f(s,b),Me()}Ce(["click"]);function Mr(){de.toggleViewMode()}var Lr=G('<meta name="viewport" content="width=device-width, initial-scale=1.0"/>'),Sr=G('<div class="flex flex-col items-center gap-4"><div class="flex flex-wrap items-center justify-center gap-3"><!> <!> <!> <!> <button class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors svelte-12qhfyh" title="Reset all filters">↻ Reset</button> <div class="view-toggle-container"><button class="view-toggle-button flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"><!></button></div></div></div>'),Pr=G('<div class="bg-background text-foreground min-h-screen"><!> <section class="filter-section sticky top-[104px] z-30 md:top-[110px] svelte-12qhfyh"><div class="container mx-auto space-y-4 px-6 py-4"><!> <!></div></section> <main style="background-color: var(--color-background);" class="px-6 pt-0 pb-6"><div class="container mx-auto"><!></div></main> <!></div>');function Fr(s,a){Te(a,!0);let t=!1,i,d=F(ue({platforms:[],genres:[],tiers:[]})),g=F("gallery"),u=F("all");H(()=>ze.subscribe(n=>{x(d,pa(n),!0)})),H(()=>de.viewMode.subscribe(n=>{x(g,n,!0)})),H(()=>de.activeTab.subscribe(n=>{x(u,n,!0)})),H(()=>{if(!t){const h=Qe.url.searchParams.get("game");h&&setTimeout(()=>{const n=ze.getGameBySlug(h);n&&be.openViewModal(n)},100),t=!0}});let b={searchQuery:"",selectedPlatforms:[],selectedGenres:[],selectedTiers:[],ratingRanges:{presentation:[0,10],story:[0,10],gameplay:[0,10],total:[0,20]}};z.filterState.subscribe(h=>{b=h}),H(()=>{t&&(i&&clearTimeout(i),i=setTimeout(()=>{de.writeToURLWithFilters(z)},300))}),H(()=>{const h=Qe.url,n=h.searchParams.get("search")||"",P=h.searchParams.get("platforms")||"",k=h.searchParams.get("genres")||"",c=h.searchParams.get("tiers")||"",v=h.searchParams.get("ratingPresentation")||"",w=h.searchParams.get("ratingStory")||"",B=h.searchParams.get("ratingGameplay")||"",Q=h.searchParams.get("ratingTotal")||"",$={searchQuery:n,selectedPlatforms:P?P.split(","):[],selectedGenres:k?k.split(","):[],selectedTiers:c?c.split(","):[],ratingRanges:{presentation:v?v.split(",").map(Number):[0,10],story:w?w.split(",").map(Number):[0,10],gameplay:B?B.split(",").map(Number):[0,10],total:Q?Q.split(",").map(Number):[0,20]}},M=JSON.stringify($),O=JSON.stringify(b);t&&M!==O&&z.readFromURL(Qe.url.searchParams),z.readFromURL(Qe.url.searchParams)});let R=F(ue([])),D=F(ue([])),j=F(ue([]));H(()=>{const h=z.selectedPlatforms.subscribe(k=>{x(R,k,!0)}),n=z.selectedGenres.subscribe(k=>{x(D,k,!0)}),P=z.selectedTiers.subscribe(k=>{x(j,k,!0)});return()=>{h(),n(),P()}});function L(){z.resetAllFilters(),i&&clearTimeout(i),de.writeToURLWithFilters(z)}var p=Pr();aa(h=>{var n=Lr();la.title="Gaming Tracker",f(h,n)});var C=l(p);Tr(C,{});var S=o(C,2),V=l(S),Z=l(V);da(Z,{});var oe=o(Z,2);{var re=h=>{var n=Sr(),P=l(n),k=l(P);lt(k,{type:"platforms",label:"Platforms",get options(){return e(d).platforms},get selectedOptions(){return e(R)}});var c=o(k,2);lt(c,{type:"genres",label:"Genres",get options(){return e(d).genres},get selectedOptions(){return e(D)}});var v=o(c,2);lt(v,{type:"tiers",label:"Tiers",get options(){return e(d).tiers},get selectedOptions(){return e(j)}});var w=o(v,2);qa(w,{});var B=o(w,2);B.__click=L;var Q=o(B,2),$=l(Q);$.__click=[Mr];var M=l($);{var O=Y=>{_a(Y,{size:18,class:"text-gray-600 dark:text-gray-400"})},J=Y=>{xa(Y,{size:18,class:"text-gray-600 dark:text-gray-400"})};E(M,Y=>{e(g)==="gallery"?Y(O):Y(J,!1)})}r($),r(Q),r(P),r(n),W(()=>q($,"title",e(g)==="gallery"?"Switch to table view":"Switch to gallery view")),f(h,n)};E(oe,h=>{e(u)!=="tierlist"&&h(re)})}r(V),r(S);var le=o(S,2),T=l(le),N=l(T);ra(N,()=>a.children??ia),r(T),r(le);var K=o(le,2);gr(K,{}),r(p),f(s,p),Me()}Ce(["click"]);export{Fr as component,Or as universal};
