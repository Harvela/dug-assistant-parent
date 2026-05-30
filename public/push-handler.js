/* global self, clients */
self.addEventListener('push', function (event) {
  var payload = { title: 'Dug Assistant', body: '', data: { url: '/' } };
  try {
    if (event.data) payload = event.data.json();
  } catch (e) {
    /* ignore */
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || 'Dug Assistant', {
      body: payload.body || '',
      data: payload.data || { url: '/' },
      icon: '/logo.png',
    }),
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i += 1) {
        var client = clientList[i];
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});
