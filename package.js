Package.describe({
  summary: "Returns diagnostics info on server internals in prometheus exposition format.",
  version: "0.0.1",
  name: "sevki:prometheus-exporter",
  git: "https://github.com/percolatestudio/meteor-server-info.git"
});

Npm.depends({
  "connect": "2.9.0",
  "sprintf-js": "1.0.2"
});

Package.onUse(function (api, where) {
  api.versionsFrom('METEOR@1.0.1');
  api.use(['webapp', 'mongo-livedata', 'facts'], 'server');
  api.addFiles('server-info.js', 'server');

  if (api.export)
    api.export('ServerInfo', 'server');
});
