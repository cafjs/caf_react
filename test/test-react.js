var caf_core = require('caf_core');
var json_rpc = caf_core.caf_transport.json_rpc;
var myUtils = caf_core.caf_components.myUtils;
var async = caf_core.async;
var cli = require('caf_cli');
var hello = require('./hello/main.js');
var request = require('request');

var app = hello;

var HOST='root-test.vcap.me';
var PORT=3000;

process.on('uncaughtException', function (err) {
               console.log("Uncaught Exception: " + err);
               console.log(myUtils.errToPrettyStr(err));
               process.exit(1);

});

module.exports = {
    setUp: function (cb) {
        var self = this;
        app.load(null, {name: 'top'}, 'framework.json', null,
                      function(err, $) {
                          if (err) {
                              console.log('setUP Error' + err);
                              // ignore errors here, check in method
                              cb(null);
                          } else {
                              self.$ = $;
                              cb(err, $);
                          }
                      });
    },
    tearDown: function (cb) {
        var self = this;
        if (!this.$) {
            cb(null);
        } else {
            this.$.top.__ca_graceful_shutdown__(null, cb);
        }
    },
    hello: function(test) {
        var self = this;
        test.expect(9);
        var s;
        async.waterfall([
                            function(cb) {
                                s = new cli
                                    .Session('ws://root-test.vcap.me:3000',
                                             'antonio-c1');
                                s.onopen = function() {
                                    s.hello('foo', cb);
                                };
                            },
                            function(res, cb) {
                                test.equals(res, 'Bye:foo');
                                request('http://root-test.vcap.me:3000?cache=foo',
                                        function (error, response, body) {
                                            test.ok(!error);
                                            test.equals(response.statusCode,
                                                        200);
                                            console.log(body);
                                            test.equals(body.length, 580);
                                            test.equals(typeof body, 'string');
                                            test.equals(body.indexOf('0'), 506);
                                            s.onclose = function(err) {
                                                test.ok(!err);
                                                test.ok(s.isClosed());
                                                cb(null, null);
                                            };
                                            s.close();
                                        }
                                       );
                            }
                     ], function(err, res) {
                         test.ifError(err);

                         test.done();
                     });
    }
};
