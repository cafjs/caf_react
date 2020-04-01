// Modifications copyright 2020 Caf.js Labs and contributors
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
 * React.js plug for background rendering.
 *
 * Properties:
 *
 *      {appFileName: string, separator: string, cacheService: string,
 *       expiresInSec: number}
 *
 * where:
 *
 * * `appFileName`: is a file name with path relative to the location of
 * `ca_methods.js`.  Optionally, an absolute directory path can be specified
 *  with property `appDir`.
 * * `separator`: is a token to highlight an insertion point for
 *  the rendered content in the template.
 * * `cacheService`: is the name of the service plug used for remote caching.
 * * `expiresInSec`: enables garbage collection of the cache by expiring
 * entries.
 *
 * @module caf_react/plug_react
 * @augments external:caf_components/gen_plug
 *
 */
const assert = require('assert');
const fs = require('fs');
const caf_core = require('caf_core');
const caf_comp = caf_core.caf_components;
const genPlug = caf_comp.gen_plug;
const path = require('path');
const util = require('util');

exports.newInstance = async function($, spec) {
    try {
        const that = genPlug.create($, spec);

        $._.$.log && $._.$.log.debug('New react plug');

        process.env.NODE_ENV = 'production';

        assert.equal(typeof spec.env.appFileName, 'string',
                     "'spec.env.appFileName' is not a string");

        const appDir = spec.env.appDir || $._.$.loader.__ca_firstModulePath__();
        assert.equal(typeof appDir, 'string',
                     "'spec.env.appDir' is not a string");

        const template = fs.readFileSync(path.resolve(appDir,
                                                      spec.env.appFileName),
                                         'utf8');
        const separator = spec.env.separator;
        assert.equal(typeof separator, 'string',
                     "'spec.env.separator' is not a string");

        const templateSplit = template.split(separator);
        if (templateSplit.length !== 2) {
            const err = new Error('Cannot split html template in two');
            err.separator = separator;
            err.template = template;
            throw err;
        }

        assert.equal(typeof spec.env.cacheService, 'string',
                     "'spec.env.cacheService' is not a string");
        const cs = spec.env.cacheService;
        const updateCachePromiseF = util.promisify($._.$[cs].updateCache);

        const expiresInSec = spec.env.expiresInSec;
        assert.equal(typeof spec.env.expiresInSec, 'number',
                     "'spec.env.expiresInSec' is not a number");


        /*
         * Renders and caches the application snapshot.
         *
         * @param {string} key A key for the cache entry.
         * @param {string} partialRendering The rendering of the app before
         * applying the template.
         *
         * @return Promise A promise to return an optional error.
         */
        that.__ca_render__ = function(key, partialRendering) {
            const value = [
                templateSplit[0], separator, partialRendering, templateSplit[1]
            ].join('');

            return updateCachePromiseF(key, value, expiresInSec);
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
