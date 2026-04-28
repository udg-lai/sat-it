import"../chunks/Bzak7iHL.js";import{y as d,ac as p,af as r,A as m,C as i,D as $,W as y,ad as g,t as h,ai as v}from"../chunks/B9UyZnRg.js";import{i as w}from"../chunks/BNprnyMz.js";import{p as t,a as C,h as I,l as N,t as _,g as b,b as L,c as q}from"../chunks/CXPf645d.js";const S=!0,T=!1,hn=Object.freeze(Object.defineProperty({__proto__:null,prerender:S,ssr:T},Symbol.toStringTag,{value:"Module"})),k="logarithmic.dimacs",A=`
p cnf 9 18
c at most one among 1,2,..6, log encoding
-1 -7 0
-1 -8 0
-1 -9 0
-2 -7 0
-2 -8 0
-2 9 0
-3 -7 0
-3 8 0
-3 -9 0
-4 -7 0
-4 8 0
-4 9 0
-5 7 0
-5 -8 0
-5 -9 0
-6 7 0
-6 -8 0
-6 9 0
`,O=t(A),D={name:k.toLowerCase(),summary:O},j="pb.dimacs",z=`
p cnf 12 15
c unitary clauses
5 0
-11 0
12 0
c node vr
6 -1 -5 0
7 -5 0
c node v2
8 -2 -6 0
9 -6 0
c node v3
10 -2 -7 0
9 -7 0
c node v4
11 -3 -8 0
10 -8 0
c node v5
10 -3 -9 0
12 -9 0
c node v6
11 -4 -10 0
12 -10 0
`,B=t(z),E={name:j.toLowerCase(),summary:B},M="NQueens3.dimacs",P=`
c SAT encoding for 3 queens
c Chess board has 9 positions
p cnf 9 34
1 2 3 0
-1 -2 0
-1 -3 0
-2 -3 0
4 5 6 0
-4 -5 0
-4 -6 0
-5 -6 0
7 8 9 0
-7 -8 0
-7 -9 0
-8 -9 0
1 4 7 0
-1 -4 0
-1 -7 0
-4 -7 0
2 5 8 0
-2 -5 0
-2 -8 0
-5 -8 0
3 6 9 0
-3 -6 0
-3 -9 0
-6 -9 0
-4 -8 0
-1 -5 0
-1 -9 0
-5 -9 0
-2 -6 0
-6 -8 0
-3 -5 0
-3 -7 0
-5 -7 0
-2 -4 0
`,Q=t(P),W={name:M.toLowerCase(),summary:Q},x="NQueens4.dimacs",R=`
c SAT encoding for 4queens
p cnf 16 84
c one queen per row
1 2 3 4 0
-1 -2 0
-1 -3 0
-1 -4 0
-2 -3 0
-2 -4 0
-3 -4 0
5 6 7 8 0
-5 -6 0
-5 -7 0
-5 -8 0
-6 -7 0
-6 -8 0
-7 -8 0
9 10 11 12 0
-9 -10 0
-9 -11 0
-9 -12 0
-10 -11 0
-10 -12 0
-11 -12 0
13 14 15 16 0
-13 -14 0
-13 -15 0
-13 -16 0
-14 -15 0
-14 -16 0
-15 -16 0
c one queen per column
1 5 9 13 0
-1 -5 0
-1 -9 0
-1 -13 0
-5 -9 0
-5 -13 0
-9 -13 0
2 6 10 14 0
-2 -6 0
-2 -10 0
-2 -14 0
-6 -10 0
-6 -14 0
-10 -14 0
3 7 11 15 0
-3 -7 0
-3 -11 0
-3 -15 0
-7 -11 0
-7 -15 0
-11 -15 0
4 8 12 16 0
-4 -8 0
-4 -12 0
-4 -16 0
-8 -12 0
-8 -16 0
-12 -16 0
c One queen per diagonal left-right
-3 -8 0
-2 -7 0
-2 -12 0
-7 -12 0
-1 -6 0
-1 -11 0
-1 -16 0
-6 -11 0
-6 -16 0
-11 -16 0
-5 -10 0
-5 -15 0
-10 -15 0
-9 -14 0
c One queen per diagonal right-left
-2 -5 0
-3 -6 0
-3 -9 0
-6 -9 0
-4 -7 0
-4 -10 0
-4 -13 0
-7 -10 0
-7 -13 0
-10 -13 0
-8 -11 0
-8 -14 0
-11 -14 0
-12 -15 0`,F=t(R),G={name:x.toLowerCase(),summary:F},H="satback.dimacs",J=`
p cnf 2 3
1 -2 0
-1 2 0
-1 -2 0
`,K=t(J),U={name:H.toLowerCase(),summary:K},V="satdpll.dimacs",X=`
p cnf 5 6
3 4 -1 5 0
-3 4 5 0
3 -4 -1 0
1 2 0
-1 -5 0
-3 -4 5 0
`,Y=t(X),Z={name:V.toLowerCase(),summary:Y},nn="unsatback.dimacs",en=`
p cnf 2 4
1 2 0
1 -2 0
-1 2 0
-1 -2 0
`,tn=t(en),sn={name:nn.toLowerCase(),summary:tn},an="unsatdpll.dimacs",on=`
p cnf 5 7
3 4 -1 5 0
-3 4 5 0
3 -4 -1 0
1 2 0
1 -2 0
-1 -5 0
-3 -4 5 0
`,cn=t(on),rn={name:an.toLowerCase(),summary:cn};function mn(n){return new Promise(e=>setTimeout(e,n))}async function un(){return await mn(300),[E,W,G,D,sn,rn,Z,U]}async function fn(){return await un()}async function ln(){try{(await fn()).map(e=>{C(e,I)})}catch(n){const e=n==null?void 0:n.message;N("Could not load instances",`Error: ${e??n}`)}}function dn(){if(_()){const[n]=b();L(n.getInstance().name)}else q("Can not set default instance from an empty set")}function vn(n,e){d(e,!0);let a=g(!1);p(()=>{ln().then(()=>{dn(),y(a,!0)}).catch(()=>console.error("There was an error during the loading process"))});var o=r(),u=m(o);{var f=s=>{var c=r(),l=m(c);v(l,()=>e.children),i(s,c)};w(u,s=>{h(a)&&s(f)})}i(n,o),$()}export{vn as component,hn as universal};
