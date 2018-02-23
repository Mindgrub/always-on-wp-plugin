var CACHE = 'alwayson-precache';
var precacheFiles = [
  /* Add an array of files to precache for your app */
  "/wp-content/themes/twentyseventeen/style.css?ver=4.9.4",
  "/wp-includes/js/jquery/jquery.js?ver=1.12.4",
  "/wp-content/themes/twentyseventeen/assets/images/header.jpg",
  "/wp-content/uploads/2018/02/mindgrub-logo-RGB-stacked-1024x470.png",
  "/wp-content/themes/twentyseventeen/assets/js/global.js?ver=1.0",
  "/offline"
];

// Register our service worker.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js');
  });
}

// Install stage sets up the cache-array to configure pre-cache content.
self.addEventListener('install', function(event) {
  console.log("Installing serviceworker.");
  event.waitUntil(
    caches.open('alwayson-precache')
      .then(function(cache) {
        return cache.addAll(precacheFiles);
      })
  );

});

// Allow sw to control of current page.
self.addEventListener('activate', function(event) {
  return self.clients.claim();

});

// Add event listener for fetch so we can intercept network requests.
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(async function() {
      let normalizedUrl = new URL(event.request.url);
      normalizedUrl.search = '';

      // Create promises for both the network response,
      // and a copy of the response that can be used in the cache.
      const fetchResponseP = fetch(normalizedUrl);
      const fetchResponseCloneP = fetchResponseP.then(r => r.clone());

      // event.waitUntil() ensures that the service worker is kept alive
      // long enough to complete the cache update.
      event.waitUntil(async function() {
        const cache = await caches.open('alwayson-precache');
        await cache.put(normalizedUrl, await fetchResponseCloneP);
      }());

      // Prefer the cached response, falling back to the fetch response.
      return (await caches.match(normalizedUrl)) || fetchResponseP;
    }());
  }
});

// Update our cached version to the latest.
function update(request) {
  //this is where we call the server to get the newest version of the
  //file to use the next time we show view
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}
