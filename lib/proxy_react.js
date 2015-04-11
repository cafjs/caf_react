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
 * Proxy to manage react policies from handler code.
 *
 * @name caf_react/proxy_react
 * @namespace
 * @augments gen_proxy
 *
 */
var caf_comp = require('caf_components');
var genProxy = caf_comp.gen_proxy;

/**
 * Factory method to create a proxy to manage react policies.
 *
 * @see sup_main
 */
exports.newInstance = function($, spec, cb) {

    var that = genProxy.constructor($, spec);

    /**
     * Sets the key used to cache a rendered application.
     * Null disables background rendering.
     *
     *
     * @param {string|null} key A  key to cache a rendered application.
     *
     * @name caf_react/setCacheKey
     * @function
     *
     */
    that.setCacheKey = function(key) {
        $._.setCacheKey(key);
    };


    /**
     * Renders and caches the application.
     *
     * @param {function(any) : string} f A pure function that renders the
     * application into an string, which can later on be inserted in a (html)
     * template.
     * @param {Array.<any>} args An array with  arguments for 'f'.
     *
     * @name caf_react/render
     * @function
     *
     */
    that.render = function(f, args) {
        $._.render(f, args);
    };

    Object.freeze(that);
    cb(null, that);
};
