module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},13714,e=>{"use strict";var t=e.i(47909),r=e.i(74017),o=e.i(96250),a=e.i(59756),n=e.i(61916),s=e.i(74677),i=e.i(69741),l=e.i(16795),d=e.i(87718),p=e.i(95169),c=e.i(47587),u=e.i(66012),x=e.i(70101),g=e.i(26937),f=e.i(10372),h=e.i(93695);e.i(52474);var m=e.i(5232),v=e.i(46245),b=e.i(89171);let y=new v.Resend(process.env.RESEND_API_KEY),R={processing:{emoji:"🔄",label:"Order Processing",message:"Great news! Your order is now being processed and prepared for shipment.",color:"#3b82f6"},shipped:{emoji:"🚚",label:"Your Order Has Been Shipped!",message:"Your order is on its way! Expect delivery within 3–5 business days.",color:"#8b5cf6"},delivered:{emoji:"✅",label:"Order Delivered",message:"Your order has been delivered. We hope you love your purchase!",color:"#22c55e"},cancelled:{emoji:"❌",label:"Order Cancelled",message:"Your order has been cancelled. If you have questions, please contact us.",color:"#ef4444"}};async function w(e){if(!process.env.RESEND_API_KEY||"<your_resend_api_key>"===process.env.RESEND_API_KEY)return console.warn("RESEND_API_KEY not configured — skipping email."),b.NextResponse.json({success:!0,skipped:!0});let{email:t,orderNumber:r,status:o,total:a,items:n,customerName:s,customerAddress:i,expectedDelivery:l}=await e.json(),d=R[o];if(!d)return b.NextResponse.json({error:"Unknown status"},{status:400});let p="http://localhost:3000",c=("shipped"===o||"delivered"===o)&&n?.length?`
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;padding-bottom:8px;border-bottom:2px solid #000;">Item</th>
          <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;padding-bottom:8px;border-bottom:2px solid #000;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${n.map(e=>`
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">
              <strong>${e.name}</strong><br/>
              <span style="color:#999;font-size:12px;">Size: ${e.size}${(e.qty??1)>1?` &times;${e.qty}`:""}</span>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;color:#c9a98a;font-size:14px;">
              &#8369;${(e.price*(e.qty??1)).toLocaleString()}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `:"",u="shipped"===o&&i?`
    <div style="background:#faf9f7;border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;">Delivering To</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
        <strong>${s??""}</strong><br/>
        ${i}
      </p>
    </div>
  `:"",x="shipped"===o?`
    <div style="background:#f3f0ff;border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8b5cf6;">Estimated Delivery</p>
      <p style="margin:0;font-size:16px;font-weight:bold;color:#000;">${l??"3–5 business days"}</p>
    </div>
  `:"",g="delivered"===o?`
    <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
      <p style="margin:0 0 8px;font-size:14px;color:#333;">Enjoying your purchase? Leave a review!</p>
      <a href="${p}/shop"
        style="display:inline-block;background:#22c55e;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:bold;">
        Write a Review
      </a>
    </div>
  `:"",{data:f,error:h}=await y.emails.send({from:"Chay Fashion <onboarding@resend.dev>",to:t,subject:`${d.emoji} ${d.label} – Order #${r}`,html:`
      <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#333;background:#fff;">

        <!-- HEADER -->
        <div style="background:#000;padding:24px 32px;">
          <h1 style="color:#fff;font-size:26px;font-style:italic;margin:0;">Chay Fashion</h1>
        </div>

        <!-- BODY -->
        <div style="padding:32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:48px;margin-bottom:12px;">${d.emoji}</div>
            <h2 style="font-size:22px;margin:0 0 8px;">${d.label}</h2>
            <p style="color:#666;font-size:14px;margin:0;">${d.message}</p>
          </div>

          <!-- ORDER NUMBER -->
          <div style="background:#f5f5f5;border-radius:12px;padding:16px;text-align:center;margin-bottom:20px;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;">Order Number</p>
            <p style="margin:0;font-size:18px;font-weight:bold;color:#000;">#${r}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#666;">Total: <strong>&#8369;${Number(a).toLocaleString()}</strong></p>
          </div>

          ${x}
          ${u}
          ${c}
          ${g}

          <!-- STATUS BAR -->
          <div style="border-left:4px solid ${d.color};padding:12px 16px;background:#fafafa;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <p style="margin:0;font-size:13px;color:#555;">
              Status updated to <strong style="color:${d.color};">${d.label}</strong>
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align:center;">
            <a href="${p}/orders"
              style="display:inline-block;background:#000;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:1px;">
              View My Orders
            </a>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:11px;color:#999;">
          \xa9 2026 Chay Fashion. All rights reserved.
        </div>
      </div>
    `});return h?(console.error("Resend error:",h),b.NextResponse.json({error:h},{status:500})):b.NextResponse.json({success:!0,id:f?.id})}e.s(["POST",0,w],65935);var E=e.i(65935);let C=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/send-status-email/route",pathname:"/api/send-status-email",filename:"route",bundlePath:""},distDir:".next-buildcheck-3",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/send-status-email/route.ts",nextConfigOutput:"",userland:E}),{workAsyncStorage:A,workUnitAsyncStorage:k,serverHooks:N}=C;async function $(e,t,o){o.requestMeta&&(0,a.setRequestMeta)(e,o.requestMeta),C.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let v="/api/send-status-email/route";v=v.replace(/\/index$/,"")||"/";let b=await C.prepare(e,t,{srcPage:v,multiZoneDraftMode:!1});if(!b)return t.statusCode=400,t.end("Bad Request"),null==o.waitUntil||o.waitUntil.call(o,Promise.resolve()),null;let{buildId:y,params:R,nextConfig:w,parsedUrl:E,isDraftMode:A,prerenderManifest:k,routerServerContext:N,isOnDemandRevalidate:$,revalidateOnlyGenerated:S,resolvedPathname:O,clientReferenceManifest:_,serverActionsManifest:T}=b,j=(0,i.normalizeAppPath)(v),P=!!(k.dynamicRoutes[j]||k.routes[O]),q=async()=>((null==N?void 0:N.render404)?await N.render404(e,t,E,!1):t.end("This page could not be found"),null);if(P&&!A){let e=!!k.routes[O],t=k.dynamicRoutes[j];if(t&&!1===t.fallback&&!e){if(w.adapterPath)return await q();throw new h.NoFallbackError}}let z=null;!P||C.isDev||A||(z="/index"===(z=O)?"/":z);let D=!0===C.isDev||!P,I=P&&!D;T&&_&&(0,s.setManifestsSingleton)({page:v,clientReferenceManifest:_,serverActionsManifest:T});let H=e.method||"GET",U=(0,n.getTracer)(),M=U.getActiveScopeSpan(),F=!!(null==N?void 0:N.isWrappedByNextServer),K=!!(0,a.getRequestMeta)(e,"minimalMode"),B=(0,a.getRequestMeta)(e,"incrementalCache")||await C.getIncrementalCache(e,w,k,K);null==B||B.resetRequestCache(),globalThis.__incrementalCache=B;let Y={params:R,previewProps:k.preview,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:D,incrementalCache:B,cacheLifeProfiles:w.cacheLife,waitUntil:o.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,o,a)=>C.onRequestError(e,t,o,a,N)},sharedContext:{buildId:y}},L=new l.NodeNextRequest(e),W=new l.NodeNextResponse(t),G=d.NextRequestAdapter.fromNodeNextRequest(L,(0,d.signalFromNodeResponse)(t));try{let a,s=async e=>C.handle(G,Y).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=U.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=r.get("next.route");if(o){let t=`${H} ${o}`;e.setAttributes({"next.route":o,"http.route":o,"next.span_name":t}),e.updateName(t),a&&a!==e&&(a.setAttribute("http.route",o),a.updateName(t))}else e.updateName(`${H} ${v}`)}),i=async a=>{var n,i;let l=async({previousCacheEntry:r})=>{try{if(!K&&$&&S&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(a);e.fetchMetrics=Y.renderOpts.fetchMetrics;let i=Y.renderOpts.pendingWaitUntil;i&&o.waitUntil&&(o.waitUntil(i),i=void 0);let l=Y.renderOpts.collectedTags;if(!P)return await (0,u.sendResponse)(L,W,n,Y.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,x.toNodeOutgoingHttpHeaders)(n.headers);l&&(t[f.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==Y.renderOpts.collectedRevalidate&&!(Y.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&Y.renderOpts.collectedRevalidate,o=void 0===Y.renderOpts.collectedExpire||Y.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:Y.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:o}}}}catch(t){throw(null==r?void 0:r.isStale)&&await C.onRequestError(e,t,{routerKind:"App Router",routePath:v,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:I,isOnDemandRevalidate:$})},!1,N),t}},d=await C.handleResponse({req:e,nextConfig:w,cacheKey:z,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:k,isRoutePPREnabled:!1,isOnDemandRevalidate:$,revalidateOnlyGenerated:S,responseGenerator:l,waitUntil:o.waitUntil,isMinimalMode:K});if(!P)return null;if((null==d||null==(n=d.value)?void 0:n.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(i=d.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});K||t.setHeader("x-nextjs-cache",$?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),A&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,x.fromNodeOutgoingHttpHeaders)(d.value.headers);return K&&P||p.delete(f.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,g.getCacheControlHeader)(d.cacheControl)),await (0,u.sendResponse)(L,W,new Response(d.value.body,{headers:p,status:d.value.status||200})),null};F&&M?await i(M):(a=U.getActiveScopeSpan(),await U.withPropagatedContext(e.headers,()=>U.trace(p.BaseServerSpan.handleRequest,{spanName:`${H} ${v}`,kind:n.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},i),void 0,!F))}catch(t){if(t instanceof h.NoFallbackError||await C.onRequestError(e,t,{routerKind:"App Router",routePath:j,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:I,isOnDemandRevalidate:$})},!1,N),P)throw t;return await (0,u.sendResponse)(L,W,new Response(null,{status:500})),null}}e.s(["handler",0,$,"patchFetch",0,function(){return(0,o.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:k})},"routeModule",0,C,"serverHooks",0,N,"workAsyncStorage",0,A,"workUnitAsyncStorage",0,k],13714)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0pa89y9._.js.map