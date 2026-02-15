module.exports=[70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},69222,e=>{"use strict";async function t(e){let t=new TextEncoder().encode("porch-coffee-cart"+e);return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",t))).map(e=>e.toString(16).padStart(2,"0")).join("")}async function r(e,r){return await t(e)===r}function n(e,t){return btoa(JSON.stringify({id:e,name:t,exp:Date.now()+6048e5}))}function o(e){try{let t=JSON.parse(atob(e));if(!t.id||!t.name||!t.exp||Date.now()>t.exp)return null;return t}catch{return null}}e.s(["EMPLOYEE_COOKIE_NAME",0,"cc_employee_session","INVITE_CODE",0,"7777","SESSION_COOKIE_OPTIONS",0,{httpOnly:!0,secure:!0,sameSite:"lax",maxAge:604800,path:"/"},"createSessionToken",()=>n,"decodeSessionToken",()=>o,"hashPin",()=>t,"verifyPin",()=>r])},68111,e=>{"use strict";var t=e.i(47909),r=e.i(74017),n=e.i(96250),o=e.i(59756),a=e.i(61916),i=e.i(74677),s=e.i(69741),l=e.i(16795),d=e.i(87718),p=e.i(95169),c=e.i(47587),u=e.i(66012),h=e.i(70101),m=e.i(26937),x=e.i(10372),g=e.i(93695);e.i(52474);var f=e.i(220),E=e.i(89171),R=e.i(93458),v=e.i(46245),y=e.i(69222),w=e.i(89660);let b=new v.Resend(process.env.RESEND_API_KEY);async function C(e,{params:t}){try{let e=await (0,R.cookies)(),r=e.get(y.EMPLOYEE_COOKIE_NAME)?.value;if(!r)return E.NextResponse.json({error:"Not authenticated"},{status:401});if(!(0,y.decodeSessionToken)(r))return E.NextResponse.json({error:"Invalid or expired session"},{status:401});let{id:n}=await t,o=(0,w.createServiceRoleClient)(),{error:a}=await o.from("cc_bookings").update({status:"completed"}).eq("id",n);if(a)return console.error("Error completing booking:",a),E.NextResponse.json({error:"Failed to complete booking"},{status:500});let{data:i,error:s}=await o.from("cc_bookings").select("*").eq("id",n).single();if(s||!i)return console.error("Error fetching booking for email:",s),E.NextResponse.json({error:"Booking completed but email failed"},{status:500});let l=i.travel_distance_miles||0,d=2*l,p=.725*d,c=2*p,u=new Date(i.event_date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),h=i.custom_event_type||i.event_type||"Event",m=`
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Courier New', monospace;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f9f9f9;
    }
    .container {
      background: #fff;
      padding: 30px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
    h2 {
      color: #6B4423;
      margin-top: 0;
    }
    .divider {
      color: #6B4423;
      font-weight: bold;
    }
    .total-line {
      font-weight: bold;
      font-size: 16px;
      color: #6B4423;
    }
    .note {
      color: #888;
      font-size: 13px;
      margin-top: 20px;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>MILEAGE REIMBURSEMENT SUMMARY</h2>
    <p class="divider">${"━".repeat(35)}</p>
    <p><strong>Event:</strong> ${i.customer_name||"Customer"}'s ${h} — ${u}</p>
    <p><strong>Round trip:</strong> ${d.toFixed(1)} miles</p>
    <br>
    <p>Employee 1: ${d.toFixed(1)} mi \xd7 $0.725 = $${p.toFixed(2)}</p>
    <p>Employee 2: ${d.toFixed(1)} mi \xd7 $0.725 = $${p.toFixed(2)}</p>
    <p class="divider">${"─".repeat(35)}</p>
    <p class="total-line">Total mileage owed: $${c.toFixed(2)}</p>
    <p class="note">(This is separate from hourly wages handled through Square)</p>
  </div>
</body>
</html>
    `;try{await b.emails.send({from:"The Porch Coffee Bar <onboarding@resend.dev>",to:"shopcolby@gmail.com",subject:`Mileage Reimbursement — ${h} — ${u}`,html:m}),console.log("Mileage email sent to Jennifer")}catch(e){console.error("Error sending mileage email:",e)}return E.NextResponse.json({success:!0})}catch(e){return console.error("Complete booking API error:",e),E.NextResponse.json({error:"Something went wrong"},{status:500})}}e.s(["POST",()=>C],88069);var S=e.i(88069);let N=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/bookings/[id]/complete/route",pathname:"/api/bookings/[id]/complete",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/bookings/[id]/complete/route.ts",nextConfigOutput:"standalone",userland:S}),{workAsyncStorage:_,workUnitAsyncStorage:A,serverHooks:k}=N;function O(){return(0,n.patchFetch)({workAsyncStorage:_,workUnitAsyncStorage:A})}async function T(e,t,n){N.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let E="/api/bookings/[id]/complete/route";E=E.replace(/\/index$/,"")||"/";let R=await N.prepare(e,t,{srcPage:E,multiZoneDraftMode:!1});if(!R)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:v,params:y,nextConfig:w,parsedUrl:b,isDraftMode:C,prerenderManifest:S,routerServerContext:_,isOnDemandRevalidate:A,revalidateOnlyGenerated:k,resolvedPathname:O,clientReferenceManifest:T,serverActionsManifest:P}=R,I=(0,s.normalizeAppPath)(E),$=!!(S.dynamicRoutes[I]||S.routes[O]),j=async()=>((null==_?void 0:_.render404)?await _.render404(e,t,b,!1):t.end("This page could not be found"),null);if($&&!C){let e=!!S.routes[O],t=S.dynamicRoutes[I];if(t&&!1===t.fallback&&!e){if(w.experimental.adapterPath)return await j();throw new g.NoFallbackError}}let q=null;!$||N.isDev||C||(q="/index"===(q=O)?"/":q);let M=!0===N.isDev||!$,D=$&&!M;P&&T&&(0,i.setManifestsSingleton)({page:E,clientReferenceManifest:T,serverActionsManifest:P});let U=e.method||"GET",H=(0,a.getTracer)(),F=H.getActiveScopeSpan(),K={params:y,prerenderManifest:S,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:w.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n,o)=>N.onRequestError(e,t,n,o,_)},sharedContext:{buildId:v}},B=new l.NodeNextRequest(e),L=new l.NodeNextResponse(t),Y=d.NextRequestAdapter.fromNodeNextRequest(B,(0,d.signalFromNodeResponse)(t));try{let i=async e=>N.handle(Y,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=H.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${U} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${U} ${E}`)}),s=!!(0,o.getRequestMeta)(e,"minimalMode"),l=async o=>{var a,l;let d=async({previousCacheEntry:r})=>{try{if(!s&&A&&k&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=await i(o);e.fetchMetrics=K.renderOpts.fetchMetrics;let l=K.renderOpts.pendingWaitUntil;l&&n.waitUntil&&(n.waitUntil(l),l=void 0);let d=K.renderOpts.collectedTags;if(!$)return await (0,u.sendResponse)(B,L,a,K.renderOpts.pendingWaitUntil),null;{let e=await a.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(a.headers);d&&(t[x.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=x.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,n=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=x.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:f.CachedRouteKind.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==r?void 0:r.isStale)&&await N.onRequestError(e,t,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:A})},!1,_),t}},p=await N.handleResponse({req:e,nextConfig:w,cacheKey:q,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:S,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:k,responseGenerator:d,waitUntil:n.waitUntil,isMinimalMode:s});if(!$)return null;if((null==p||null==(a=p.value)?void 0:a.kind)!==f.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==p||null==(l=p.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});s||t.setHeader("x-nextjs-cache",A?"REVALIDATED":p.isMiss?"MISS":p.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let g=(0,h.fromNodeOutgoingHttpHeaders)(p.value.headers);return s&&$||g.delete(x.NEXT_CACHE_TAGS_HEADER),!p.cacheControl||t.getHeader("Cache-Control")||g.get("Cache-Control")||g.set("Cache-Control",(0,m.getCacheControlHeader)(p.cacheControl)),await (0,u.sendResponse)(B,L,new Response(p.value.body,{headers:g,status:p.value.status||200})),null};F?await l(F):await H.withPropagatedContext(e.headers,()=>H.trace(p.BaseServerSpan.handleRequest,{spanName:`${U} ${E}`,kind:a.SpanKind.SERVER,attributes:{"http.method":U,"http.target":e.url}},l))}catch(t){if(t instanceof g.NoFallbackError||await N.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:A})},!1,_),$)throw t;return await (0,u.sendResponse)(B,L,new Response(null,{status:500})),null}}e.s(["handler",()=>T,"patchFetch",()=>O,"routeModule",()=>N,"serverHooks",()=>k,"workAsyncStorage",()=>_,"workUnitAsyncStorage",()=>A],68111)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__fd89d6f4._.js.map