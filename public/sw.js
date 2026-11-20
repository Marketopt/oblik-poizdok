const CACHE='oblik-poizdok-shell-v3';
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache=await caches.open(CACHE);
  const home=new URL('./',self.registration.scope).href;
  const response=await fetch(home,{cache:'reload'});
  if(!response.ok) throw Error('App shell unavailable');
  await cache.put(home,response.clone());
  const html=await response.text();
  const assets=[...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(m=>new URL(m[1],home).href);
  assets.push(new URL('manifest.webmanifest',home).href,new URL('icons/icon-180.png',home).href,new URL('icons/icon-192.png',home).href,new URL('icons/icon-512.png',home).href);
  await cache.addAll([...new Set(assets)]);
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('oblik-poizdok-shell-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(req.mode==='navigate'){
      try{const response=await fetch(req);if(response.ok)await cache.put(new URL('./',self.registration.scope).href,response.clone());return response}
      catch{return await cache.match(new URL('./',self.registration.scope).href)||Response.error()}
    }
    const cached=await cache.match(req);
    if(cached)return cached;
    try{return await fetch(req)}catch{return Response.error()}
  })());
});
