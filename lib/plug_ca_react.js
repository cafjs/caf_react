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

"use strict";

/**
 * React plug for background application rendering.
 *
 * @name caf_react/plug_ca_react
 * @namespace
 * @augments caf_components/gen_plug_ca
 *
 */
var caf_comp = require('caf_components');
var myUtils = caf_comp.myUtils;
var genPlugCA = caf_comp.gen_plug_ca;

/**
 * Factory method for a React.js plug for this CA.
 *
 * @see caf_components/supervisor
 */
exports.newInstance = function($, spec, cb) {
    try {

        var cacheKey = null;

        var that = genPlugCA.constructor($, spec);

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
            that.__ca_lazyApply__("setCacheKeyImpl", [key]);
        };

        that.render = function(f, args) {
            if (!cacheKey) {
                $._.$.log &&
                    $._.$.log.debug('No cacheKey, disabling rendering');
            } else {
                var partialRendering = f.apply(f, args);
                that.__ca_lazyApply__("renderImpl", [partialRendering]);
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
