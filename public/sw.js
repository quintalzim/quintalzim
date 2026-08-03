// Service worker do Quintalzim — só cuida de push notifications por enquanto.
// Não faz cache de assets (isso fica pra uma fase futura de PWA offline-first).

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let dados = {};
  try {
    dados = event.data.json();
  } catch {
    dados = { title: "Quintalzim", body: event.data.text() };
  }

  const titulo = dados.title || "Quintalzim";
  const opcoes = {
    body: dados.body || "",
    icon: dados.icon || "/icons/icon-192.png",
    badge: dados.badge || "/icons/icon-192.png",
    data: { url: dados.url || "/app/inicio" },
  };

  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/app/inicio";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
      return undefined;
    })
  );
});
