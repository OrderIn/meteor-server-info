# sevki:prometheus-exporter (WIP)

## Description

[Meteor](http://meteor.com)  package for querying a meteor app for diagnostics information.

The package sets up a route (By default at /info) that returns a json object containing useful debugging about your running Meteor app.

This is really useful for querying your application state from an external source, such as shell scripts that may forward the data to cloudwatch or other logs.

## Example output

```
sockets_count 1
sockets_with_livedata_sessions_count 0
subs_count{collection="meteor_autoupdate_clientVersions"} 1
subs_count{collection="meteor.loginServiceConfiguration"} 1
subs_count{collection="foo"} 1
subs_count{collection="bar"} 1
documents_count{collection="meteor_autoupdate_clientVersions"} 4
documents_count{collection="foo"} 1
documents_count{collection="bar"} 1
live_results_sets_count 0
observe_handles_count 10
oplog_observe_handles_count 10
polling_observe_handles_count 0
oplog_observe_handles_count{collection="meteor_accounts_loginServiceConfiguration"} 1
oplog_observe_handles_count{collection="foo"} 1
oplog_observe_handles_count{collection="bar"} 1
users_with_nSubscriptions_count{collection="0"} 1
users_with_nSubscriptions_count{collection="10"} 1
sessions_count 2
```

## Installation

Meteor prometheus-exporter can be installed with [Meteorite](https://github.com/oortcloud/meteorite/). From inside a Meteorite-managed app:

``` sh
$ meteor add sevki:prometheus-exporter
```

## Usage

Install the package, then access /info on your running application. By default, the route is NOT protected by a username/password. You should probably 404 `/_health` on a nginx level.

From the command line, you could run `curl http://localhost:3000/_health`.


## Configuration

You can set the path and http basic authentication credentials like

``` js
ServerInfo.settings = {
  path: '/_health',
  extras: undefined //a function or any other data to add
};
```

*extras* is an optional field that will be returned as part of the json object. If you provide a function, it will be evaluated and it's return value will be added to the json object.

## License
MIT. (c) Sevki <s@sevki.org>

MIT. (c) Percolate Studio
