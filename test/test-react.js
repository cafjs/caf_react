const caf_core = require('caf_core');
const json_rpc = caf_core.caf_transport.json_rpc;
const myUtils = caf_core.caf_components.myUtils;
const async = caf_core.async;
const cli = caf_core.caf_cli;
const hello = require('./hello/main.js');
const request = require('request');

const app = hello;

const HOST='root-test.vcap.me';
const PORT=3000;
const CA= 'antonio-react' +  myUtils.uniqueId();

process.on('uncaughtException', function (err) {
               console.log("Uncaught Exception: " + err);
               console.log(myUtils.errToPrettyStr(err));
               process.exit(1);

});

module.exports = {
    setUp: function (cb) {
        const self = this;
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
        const self = this;
        if (!this.$) {
            cb(null);
        } else {
            this.$.top.__ca_graceful_shutdown__(null, cb);
        }
    },
    hello: function(test) {
        const self = this;
        test.expect(9);
        var s;
        async.waterfall([
            function(cb) {
                s = new cli.Session('ws://root-test.vcap.me:3000',CA);
                s.onopen = function() {
                    s.hello('foo', cb);
                };
            },
            function(res, cb) {
                test.equals(res, 'Bye:foo');
                setTimeout (function() {
                    s.render(cb);
                }, 1000);
            }, function(res, cb) {
                request('http://root-test.vcap.me:3000?cacheKey=foo',
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
