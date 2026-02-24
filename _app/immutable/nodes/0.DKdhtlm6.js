import"../chunks/Bzak7iHL.js";import{y as d,ac as p,af as r,A as m,C as i,D as $,W as y,ad as g,t as h,ai as v}from"../chunks/B9UyZnRg.js";import{i as w}from"../chunks/BNprnyMz.js";import{p as t,a as C,l as N,t as I,g as _,b,c as L}from"../chunks/9qpAZC71.js";const q=!0,T=!1,gn=Object.freeze(Object.defineProperty({__proto__:null,prerender:q,ssr:T},Symbol.toStringTag,{value:"Module"})),S="logarithmic.dimacs",k=`
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
`,A=t(k),O={name:S.toLowerCase(),summary:A},D="pb.dimacs",j=`
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
`,z=t(j),B={name:D.toLowerCase(),summary:z},E="NQueens3.dimacs",M=`
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
`,P=t(M),Q={name:E.toLowerCase(),summary:P},W="NQueens4.dimacs",x=`
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
-12 -15 0`,R=t(x),F={name:W.toLowerCase(),summary:R},G="satback.dimacs",H=`
p cnf 2 3
1 -2 0
-1 2 0
-1 -2 0
`,J=t(H),K={name:G.toLowerCase(),summary:J},U="satdpll.dimacs",V=`
p cnf 5 6
3 4 -1 5 0
-3 4 5 0
3 -4 -1 0
1 2 0
-1 -5 0
-3 -4 5 0
`,X=t(V),Y={name:U.toLowerCase(),summary:X},Z="unsatback.dimacs",nn=`
p cnf 2 4
1 2 0
1 -2 0
-1 2 0
-1 -2 0
`,en=t(nn),tn={name:Z.toLowerCase(),summary:en},sn="unsatdpll.dimacs",an=`
p cnf 5 7
3 4 -1 5 0
-3 4 5 0
3 -4 -1 0
1 2 0
1 -2 0
-1 -5 0
-3 -4 5 0
`,on=t(an),cn={name:sn.toLowerCase(),summary:on};function rn(n){return new Promise(e=>setTimeout(e,n))}async function mn(){return await rn(300),[B,Q,F,O,tn,cn,Y,K]}async function un(){return await mn()}async function fn(){try{(await un()).map(e=>{C(e)})}catch(n){const e=n==null?void 0:n.message;N("Could not load instances",`Error: ${e??n}`)}}function ln(){if(I()){const[n]=_();b(n.getInstance().name)}else L("Can not set default instance from an empty set")}function hn(n,e){d(e,!0);let a=g(!1);p(()=>{fn().then(()=>{ln(),y(a,!0)}).catch(()=>console.error("There was an error during the loading process"))});var o=r(),u=m(o);{var f=s=>{var c=r(),l=m(c);v(l,()=>e.children),i(s,c)};w(u,s=>{h(a)&&s(f)})}i(n,o),$()}export{hn as component,gn as universal};
