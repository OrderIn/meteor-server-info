Package.describe({
  summary: "Returns diagnostics info on server internals via a connect route.",
  version: "0.2.2",
  name: "sevki:prometheus-exporter",
  git: "https://github.com/percolatestudio/meteor-server-info"
});

Npm.depends({
  "connect": "2.9.0",
  "sprintf-js": "1.0.2"
});

Package.on_use(function (api, where) {
  api.versionsFrom('METEOR@1.0.1');
  api.use(['webapp', 'mongo-livedata', 'facts'], 'server');
  api.add_files('server-info.js', 'server');

  if (api.export)
    api.export('ServerInfo', 'server');
});
