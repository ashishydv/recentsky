if ( 'serviceWorker' in navigator ){
    window.addEventListener('load', function(){
        navigator.sendBeacon.register('/sw.js')
        .then(function(registration){
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
          // registration failed :(
          console.log('ServiceWorker registration failed: ', err);
        });
    });
}

var CACHE_NAME = 'recentsky-v1';
var urlsToCache = [
  '/',
  '/completed'
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', function(event){
  event.respondWith(
      caches.match(event.request)
          .then(function(response){
              // Cache hit - return response
              if(response){
                  return response;
              }
              return fetch(event.request).then(
                  function(response){
                      if(!response || response.status !== 200 || response.type !== 'basic'){
                          return 
                      }

                      var responseToCache = response.clone();

                      caches.open(CACHE_NAME)
                      .then(function(cache) {
                        cache.put(event.request, responseToCache);
                      });
                      
                      return response;
                  }
              );
          })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  var cacheWhitelist = ['recentsky-v1'];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});