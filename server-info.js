ServerInfo = {
  settings: {
    path: '/info',
    user: 'insecure',
    password: 'secureme',
    extras: undefined //a function or any other data to add
  },

  get: function() {
    return {
      counts: getConnectionCounts(),
      extras: getExtras()
    };
  }
}

if(typeof(Fiber)=="undefined") Fiber = Npm.require('fibers');

var connectHandlers = WebApp.connectHandlers;
var connect = Npm.require("connect");
var child_process = Npm.require('child_process');
var Future = Npm.require('fibers/future');
var sprintf = Npm.require("sprintf-js").sprintf;

// allow the user to configure the package
Meteor.startup(function() {
  connectHandlers
  .use(ServerInfo.settings.path, function(req, res, next) {
    Fiber(function () {
      res.setHeader('content-type', 'text/plain; version=0.0.4');
      return res.end(stringifyProm(ServerInfo.get()));
    }).run();
  });
})


// XXX: move this code to settings somewhere
// returns the commit hash of it exists in settings.public or nothing.
// ServerInfo.settings.extras = function() {
//   if (Meteor.settings.public)
//     return {commit: Meteor.settings.public.commit};
// }

// return extra info
function getExtras() {
  if (ServerInfo.settings.extras) {
    if (typeof ServerInfo.settings.extras === 'function')
    return ServerInfo.settings.extras.call();
    else
    return ServerInfo.settings.extras;
  }
}
function collToprop(obj, name) {
  var metrics = "";
  for(var prop in obj) {
    if(typeof obj[prop] === typeof 1) {
      metrics += sprintf("%s_count{collection=\"%s\"} %d\n", name, prop, obj[prop])
    }
  }
  return  metrics
}

function resultify(obj) {
  var metrics = "";
  for(var prop in obj) {
    var label = prop.replace(/[a-z][A-Z]/g, function(str, offset) {
      return str[0] + '_' + str[1].toLowerCase();
    });

    if(typeof obj[prop] === typeof 1) {
      if (obj[prop] !== NaN) {
        metrics += sprintf("%s_count %d\n", label, obj[prop])
      }
    } else {
      metrics += collToprop(obj[prop], label)
    }
  }
  return  metrics
}
function stringifyProm(results) {
  return resultify(results.counts);

}
// get a count of the current # of connections and each named sub
function getConnectionCounts() {
  var results = {
    nSockets: 0,
    nSocketsWithLivedataSessions: 0,
    nSubs: {},
    nDocuments: {},
    nLiveResultsSets: 0,
    nObserveHandles: 0,
    oplogObserveHandlesCount: 0,
    pollingObserveHandlesCount: 0,
    oplogObserveHandles: {},
    pollingObserveHandles: {},
    usersWithNSubscriptions: {}
  };

  var initKey = function(part, key) {
    part[key] = part[key] || 0;
  }

  // check out the connections and what we know about them
  _.each(Meteor.default_server.stream_server.open_sockets, function(socket) {
    results.nSockets += 1;

    if (socket.meteor_session)
    results.nSocketsWithLivedataSessions += 1;
  });

  // check out the sessions
  _.each(Meteor.default_server.sessions, function(session, id) {
    results.nSessions += 1;
    var subCount = _.keys(session._namedSubs).length;
    results.usersWithNSubscriptions[subCount] = results.usersWithNSubscriptions[subCount] || 0;
    results.usersWithNSubscriptions[subCount] += 1;

    _.each(session._namedSubs, function(info) {
      initKey(results.nSubs, info._name)
      results.nSubs[info._name] += 1;

      _.each(info._documents, function(docs, type) {
        initKey(results.nDocuments, type);
        results.nDocuments[type] += _.keys(docs).length;
      });
    });
  });

  _.each(MongoInternals.defaultRemoteCollectionDriver().mongo._observeMultiplexers, function(muxer) {
    _.each(muxer._handles, function(handle) {
      results.nObserveHandles += 1;

      var logStat = function(type, collectionName) {
        results[type + 'Count'] += 1;
        results[type][collectionName] = results[type][collectionName] || 0
        results[type][collectionName] += 1;
      }

      var driver = handle._observeDriver || muxer._observeDriver;
      var collectionName = driver._cursorDescription.collectionName;
      if (driver._usesOplog)
      logStat('oplogObserveHandles', collectionName);
      else
      logStat('pollingObserveHandles', collectionName);
    });
  });

  // walk facts
  if (Facts._factsByPackage) {
    results.facts = {};
    _.each(Facts._factsByPackage, function(facts, pkg) {
      results.facts[pkg] = facts;
    });
  }

  return results;
}
