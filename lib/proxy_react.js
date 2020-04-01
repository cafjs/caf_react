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
 * Proxy to manage from handler code react.js caching policies.
 *
 * @module caf_react/proxy_react
 * @augments external:caf_components/gen_proxy
 */
const caf_core = require('caf_core');
const caf_comp = caf_core.caf_components;
const genProxy = caf_comp.gen_proxy;

exports.newInstance = async function($, spec) {
    try {
        const that = genProxy.create($, spec);

        /**
         * Sets the key for caching a rendered application.
         * `null` disables background rendering.
         *
         * @param {string|null} key A  key to cache a rendered application.
         *
         * @memberof! module:caf_react/proxy_react#
         * @alias setCacheKey
         *
         */
        that.setCacheKey = function(key) {
            if (typeof key !== 'undefined') {
                $._.setCacheKey(key);
            }
        };

        /**
         * Gives another time extension to continue rendering.
         *
         * Similar to a coin operated game machine, it stops rendering after a
         * while, and it is waken up by a new coin...
         *
         * @memberof! module:caf_react/proxy_react#
         * @alias coin
         *
         */
        that.coin = function() {
            $._.coin();
        };

        /**
         * Renders and caches the application.
         *
         * @param {function(any): string} f A pure function that renders the
         * application into an string, which can later on be inserted in a
         * (html) template.
         * @param {Array.<any>} args An array with  arguments for `f`.
         *
         * @memberof! module:caf_react/proxy_react#
         * @alias render
         *
         */
        that.render = function(f, args) {
            $._.render(f, args);
        };

        Object.freeze(that);
        return [null, that];
    } catch (err) {
        return [err];
    }
};
