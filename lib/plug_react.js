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
 * React.js plug for background rendering.
 *
 *
 * @name caf_react/plug_react
 * @namespace
 * @augments gen_plug
 *
 */
var assert = require('assert');
var fs = require('fs');
var caf_comp = require('caf_components');
var genPlug = caf_comp.gen_plug;
var path = require('path');

/**
 * Factory method to create a React.js plug for background rendering.
 *
 * @see caf_components/supervisor
 */
exports.newInstance = function($, spec, cb) {

    try {
        var that = genPlug.constructor($, spec);

        $._.$.log && $._.$.log.debug('New react plug');

        assert.equal(typeof spec.env.appFileName, 'string',
                     "'spec.env.appFileName' is not a string");

        var appDir = spec.env.appDir || $._.$.loader.__ca_firstModulePath__();
        assert.equal(typeof appDir, 'string',
                     "'spec.env.appDir' is not a string");

        var template = fs.readFileSync(path.resolve(appDir,
                                                    spec.env.appFileName),
                                       'utf8');
        var separator = spec.env.separator;
        assert.equal(typeof separator, 'string',
                     "'spec.env.separator' is not a string");

        var templateSplit = template.split(separator);
        if (templateSplit.length !== 2) {
            var err =  new Error('Cannot split html template in two');
            err.separator = separator;
            err.template = template;
            throw err;
        }

        assert.equal(typeof spec.env.cacheService, 'string',
                      "'spec.env.cacheService' is not a string");
        var cs = spec.env.cacheService;

        var expiresInSec = spec.env.expiresInSec;
        assert.equal(typeof spec.env.expiresInSec, 'number',
                      "'spec.env.expiresInSec' is not a number");


        /**
         * Renders and caches the application snapshot.
         *
         * @param {string} key A key for the cache entry.
         * @param {string} partialRendering The rendering of the app before
         * applying the template.
         * @param {caf.cb} cb0 A callback to return an error.
         *
         * @name plug_react#__ca_react__
         * @function
         */
        that.__ca_render__ = function(key, partialRendering, cb0) {
            var value = [templateSplit[0], separator, partialRendering,
                         templateSplit[1]].join('');
            $._.$[cs].updateCache(key, value, expiresInSec, cb0);
        };

        cb(null, that);
    } catch (err) {
        cb(err);
    }
};