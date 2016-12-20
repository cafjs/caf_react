/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

/**
 * React plug for background application rendering.
 *
 * Properties:
 *
 *         {coinPlayTime: number}
 *
 * where `coinPlayTime` is the number of seconds it  continues to render after
 * a live interaction with the user, i.e., a call to the `coin` method.
 *
 * @module caf_react/plug_ca_react
 * @augments external:caf_components/gen_plug_ca
 *
 */
var caf_core = require('caf_core');
var caf_comp = caf_core.caf_components;
var myUtils = caf_comp.myUtils;
var genPlugCA = caf_comp.gen_plug_ca;
var assert = require('assert');

exports.newInstance = function($, spec, cb) {
    try {

        var cacheKey = null;
        var playUntil = 0;

        var that = genPlugCA.constructor($, spec);


        var coinPlayTime = spec.env.coinPlayTime;
        assert(typeof coinPlayTime === 'number');

        // transactional ops
        var target = {
            setCacheKeyImpl: function(key, cb0) {
                cacheKey = key;
                cb0(null);
            },
            renderImpl: function(partialRendering, cb0) {
                $._.$.react.__ca_render__(cacheKey, partialRendering, cb0);
            }
        };

        that.__ca_setLogActionsTarget__(target);

        that.setCacheKey = function(key) {
            that.__ca_lazyApply__('setCacheKeyImpl', [key]);
        };

        that.coin = function() {
            var t = (new Date()).getTime();
            playUntil = t + coinPlayTime*1000;
        };

        that.render = function(f, args) {
            var t1 = (new Date()).getTime();//process.hrtime()
            if (!cacheKey) {
                $._.$.log &&
                    $._.$.log.debug('No cacheKey, disabling rendering');
            } else if (t1 < playUntil) {
                var partialRendering = f.apply(f, args);
                var diff = (new Date()).getTime() -t1; //process.hrtime(t1);
                $._.$.log &&
                    $._.$.log.debug('Time to render in miliseconds: ' +
                                    JSON.stringify(diff));
                that.__ca_lazyApply__('renderImpl', [partialRendering]);
            } else {
                $._.$.log &&
                    $._.$.log.debug('Time is up, rendering disabled');
            }
        };

        // Framework methods
        var super__ca_resume__ = myUtils.superior(that, '__ca_resume__');
        that.__ca_resume__ = function(cp, cb0) {
            cacheKey = cp.cacheKey || null;
            super__ca_resume__(cp, cb0);
        };

        var super__ca_prepare__ = myUtils.superior(that, '__ca_prepare__');
        that.__ca_prepare__ = function(cb0) {
            super__ca_prepare__(function(err, data) {
                if (err) {
                    cb0(err, data);
                } else {
                    var lA = data.logActions || [];
                    // do not checkpoint rendered pages, too expensive...
                    data.logActions = lA.filter(function(x) {
                        return (x.method !== 'renderImpl');
                    });
                    data.cacheKey = cacheKey;
                    cb0(err, data);
                }
            });
        };

        cb(null, that);
    } catch (err) {
        cb(err);
    }
};
