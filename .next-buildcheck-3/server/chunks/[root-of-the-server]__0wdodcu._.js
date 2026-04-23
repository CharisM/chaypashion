module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},79969,e=>{"use strict";var t=e.i(47909),r=e.i(74017),o=e.i(96250),a=e.i(59756),n=e.i(61916),i=e.i(74677),s=e.i(69741),l=e.i(16795),d=e.i(87718),p=e.i(95169),c=e.i(47587),u=e.i(66012),x=e.i(70101),g=e.i(26937),f=e.i(10372),h=e.i(93695);e.i(52474);var y=e.i(5232),m=e.i(46245),v=e.i(89171);let b=new m.Resend(process.env.RESEND_API_KEY);async function R(e){if(!process.env.RESEND_API_KEY||"<your_resend_api_key>"===process.env.RESEND_API_KEY)return console.warn("RESEND_API_KEY not configured — skipping email."),v.NextResponse.json({success:!0,skipped:!0});let{email:t,orderNumber:r,items:o,subtotal:a,shipping:n,total:i,paymentMethod:s,deliveryAddress:l}=await e.json(),d=o.map(e=>`
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;vertical-align:middle;">
        <strong style="font-size:14px;color:#333;">${e.name}</strong><br/>
        <span style="color:#999;font-size:12px;">Size: ${e.size}${(e.qty??1)>1?` &times;${e.qty}`:""}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;vertical-align:middle;font-weight:bold;color:#c9a98a;font-size:14px;">
        &#8369;${(e.price*(e.qty??1)).toLocaleString()}
      </td>
    </tr>
  `).join(""),p=l?`
    <div style="background:#faf9f7;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;">Delivery Address</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
        <strong>${l.fullName}</strong><br/>
        ${l.phone}<br/>
        ${l.address}<br/>
        ${l.city}${l.zip?`, ${l.zip}`:""}
      </p>
    </div>
  `:"",c="gcash"===s?`
    <div style="background:#eff6ff;border-radius:12px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#3b82f6;">
        📱 <strong>GCash Payment</strong> — Please send payment to <strong>0933-699-5665</strong> and wait for verification.
      </p>
    </div>
  `:`
    <div style="background:#f5f5f5;border-radius:12px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#555;">
        📦 <strong>Cash on Delivery</strong> — Pay when your order arrives at your doorstep.
      </p>
    </div>
  `,u="http://localhost:3000",{data:x,error:g}=await b.emails.send({from:"Chay Fashion <onboarding@resend.dev>",to:t,subject:`🎉 Order Confirmed – #${r}`,html:`
      <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#333;background:#fff;">

        <!-- HEADER -->
        <div style="background:#000;padding:24px 32px;">
          <h1 style="color:#fff;font-size:26px;font-style:italic;margin:0;">Chay Fashion</h1>
        </div>

        <!-- BODY -->
        <div style="padding:32px;">
          <h2 style="font-size:22px;margin:0 0 6px;">Order Confirmed! 🎉</h2>
          <p style="color:#666;font-size:14px;margin:0 0 20px;">Thank you for shopping with us, your order is being prepared.</p>

          <div style="background:#000;color:#fff;display:inline-block;padding:6px 18px;border-radius:999px;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px;">
            Order #${r}
          </div>

          ${c}
          ${p}

          <!-- ITEMS -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <thead>
              <tr>
                <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;padding-bottom:8px;border-bottom:2px solid #000;">Item</th>
                <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;padding-bottom:8px;border-bottom:2px solid #000;">Price</th>
              </tr>
            </thead>
            <tbody>${d}</tbody>
          </table>

          <!-- TOTALS — table layout for email client compatibility -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="font-size:13px;color:#666;padding:4px 0;">Subtotal</td>
              <td style="font-size:13px;color:#666;padding:4px 0;text-align:right;">&#8369;${a.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#666;padding:4px 0;">Shipping</td>
              <td style="font-size:13px;color:#666;padding:4px 0;text-align:right;">&#8369;${n.toLocaleString()}</td>
            </tr>
            <tr style="border-top:2px solid #000;">
              <td style="font-size:16px;font-weight:bold;color:#000;padding:10px 0 0;">Total</td>
              <td style="font-size:16px;font-weight:bold;color:#000;padding:10px 0 0;text-align:right;">&#8369;${i.toLocaleString()}</td>
            </tr>
          </table>

          <!-- INFO BOX -->
          <div style="background:#faf9f7;border-radius:12px;padding:16px;font-size:13px;color:#666;margin-bottom:24px;">
            <p style="margin:0 0 6px;">📦 Ships within <strong style="color:#000;">1–2 business days</strong></p>
            <p style="margin:0 0 6px;">🚚 Estimated delivery: <strong style="color:#000;">3–5 business days</strong></p>
            <p style="margin:0;">📩 You'll receive updates when your order status changes.</p>
          </div>

          <!-- CTA -->
          <div style="text-align:center;">
            <a href="${u}/orders"
              style="display:inline-block;background:#000;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:1px;">
              View My Orders
            </a>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:11px;color:#999;">
          \xa9 2026 Chay Fashion. All rights reserved.<br/>
          <a href="${u}" style="color:#999;text-decoration:none;">chayfashion.com</a>
        </div>
      </div>
    `});return g?(console.error("Resend error:",g),v.NextResponse.json({error:g},{status:500})):v.NextResponse.json({success:!0,id:x?.id})}e.s(["POST",0,R],33298);var w=e.i(33298);let E=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/send-order-email/route",pathname:"/api/send-order-email",filename:"route",bundlePath:""},distDir:".next-buildcheck-3",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/send-order-email/route.ts",nextConfigOutput:"",userland:w}),{workAsyncStorage:C,workUnitAsyncStorage:A,serverHooks:k}=E;async function S(e,t,o){o.requestMeta&&(0,a.setRequestMeta)(e,o.requestMeta),E.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/send-order-email/route";m=m.replace(/\/index$/,"")||"/";let v=await E.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==o.waitUntil||o.waitUntil.call(o,Promise.resolve()),null;let{buildId:b,params:R,nextConfig:w,parsedUrl:C,isDraftMode:A,prerenderManifest:k,routerServerContext:S,isOnDemandRevalidate:N,revalidateOnlyGenerated:P,resolvedPathname:T,clientReferenceManifest:_,serverActionsManifest:O}=v,$=(0,s.normalizeAppPath)(m),q=!!(k.dynamicRoutes[$]||k.routes[T]),z=async()=>((null==S?void 0:S.render404)?await S.render404(e,t,C,!1):t.end("This page could not be found"),null);if(q&&!A){let e=!!k.routes[T],t=k.dynamicRoutes[$];if(t&&!1===t.fallback&&!e){if(w.adapterPath)return await z();throw new h.NoFallbackError}}let j=null;!q||E.isDev||A||(j="/index"===(j=T)?"/":j);let I=!0===E.isDev||!q,D=q&&!I;O&&_&&(0,i.setManifestsSingleton)({page:m,clientReferenceManifest:_,serverActionsManifest:O});let H=e.method||"GET",M=(0,n.getTracer)(),U=M.getActiveScopeSpan(),F=!!(null==S?void 0:S.isWrappedByNextServer),K=!!(0,a.getRequestMeta)(e,"minimalMode"),L=(0,a.getRequestMeta)(e,"incrementalCache")||await E.getIncrementalCache(e,w,k,K);null==L||L.resetRequestCache(),globalThis.__incrementalCache=L;let B={params:R,previewProps:k.preview,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:I,incrementalCache:L,cacheLifeProfiles:w.cacheLife,waitUntil:o.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,o,a)=>E.onRequestError(e,t,o,a,S)},sharedContext:{buildId:b}},Y=new l.NodeNextRequest(e),G=new l.NodeNextResponse(t),V=d.NextRequestAdapter.fromNodeNextRequest(Y,(0,d.signalFromNodeResponse)(t));try{let a,i=async e=>E.handle(V,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=M.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=r.get("next.route");if(o){let t=`${H} ${o}`;e.setAttributes({"next.route":o,"http.route":o,"next.span_name":t}),e.updateName(t),a&&a!==e&&(a.setAttribute("http.route",o),a.updateName(t))}else e.updateName(`${H} ${m}`)}),s=async a=>{var n,s;let l=async({previousCacheEntry:r})=>{try{if(!K&&N&&P&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await i(a);e.fetchMetrics=B.renderOpts.fetchMetrics;let s=B.renderOpts.pendingWaitUntil;s&&o.waitUntil&&(o.waitUntil(s),s=void 0);let l=B.renderOpts.collectedTags;if(!q)return await (0,u.sendResponse)(Y,G,n,B.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,x.toNodeOutgoingHttpHeaders)(n.headers);l&&(t[f.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,o=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:y.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:o}}}}catch(t){throw(null==r?void 0:r.isStale)&&await E.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:N})},!1,S),t}},d=await E.handleResponse({req:e,nextConfig:w,cacheKey:j,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:k,isRoutePPREnabled:!1,isOnDemandRevalidate:N,revalidateOnlyGenerated:P,responseGenerator:l,waitUntil:o.waitUntil,isMinimalMode:K});if(!q)return null;if((null==d||null==(n=d.value)?void 0:n.kind)!==y.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(s=d.value)?void 0:s.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});K||t.setHeader("x-nextjs-cache",N?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),A&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,x.fromNodeOutgoingHttpHeaders)(d.value.headers);return K&&q||p.delete(f.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,g.getCacheControlHeader)(d.cacheControl)),await (0,u.sendResponse)(Y,G,new Response(d.value.body,{headers:p,status:d.value.status||200})),null};F&&U?await s(U):(a=M.getActiveScopeSpan(),await M.withPropagatedContext(e.headers,()=>M.trace(p.BaseServerSpan.handleRequest,{spanName:`${H} ${m}`,kind:n.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},s),void 0,!F))}catch(t){if(t instanceof h.NoFallbackError||await E.onRequestError(e,t,{routerKind:"App Router",routePath:$,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:D,isOnDemandRevalidate:N})},!1,S),q)throw t;return await (0,u.sendResponse)(Y,G,new Response(null,{status:500})),null}}e.s(["handler",0,S,"patchFetch",0,function(){return(0,o.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:A})},"routeModule",0,E,"serverHooks",0,k,"workAsyncStorage",0,C,"workUnitAsyncStorage",0,A],79969)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0wdodcu._.js.map