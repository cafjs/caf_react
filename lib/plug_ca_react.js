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
const caf_core = require('caf_core');
const caf_comp = caf_core.caf_components;
const myUtils = caf_comp.myUtils;
const genPlugCA = caf_comp.gen_plug_ca;
const assert = require('assert');

exports.newInstance = async function($, spec) {
    try {
        let playUntil = 0;

        const that = genPlugCA.create($, spec);

        /*
         * The contents of this variable are always checkpointed before
         * any state externalization (see `gen_transactional`).
         */
        that.state = {}; // cacheKey:string

        const coinPlayTime = spec.env.coinPlayTime;
        assert(typeof coinPlayTime === 'number');

        // transactional ops
        const target = {
            async setCacheKeyImpl(key) {
                that.state.cacheKey = key;
                return [];
            },
            async renderImpl(partialRendering) {
                const result = [null];
                try {
                    result[1] = await $._.$.react.__ca_render__(
                        that.state.cacheKey, partialRendering
                    );
                } catch (err) {
                    result[0] = err;
                }
                return result;
            }
        };

        that.__ca_setLogActionsTarget__(target);

        that.setCacheKey = function(key) {
            that.__ca_lazyApply__('setCacheKeyImpl', [key]);
        };

        that.coin = function() {
            const t = (new Date()).getTime();
            playUntil = t + coinPlayTime*1000;
        };

        that.render = function(f, args) {
            const t1 = (new Date()).getTime();//process.hrtime()
            if (!that.state.cacheKey) {
                $._.$.log &&
                    $._.$.log.debug('No cacheKey, disabling rendering');
            } else if (t1 < playUntil) {
                const partialRendering = f.apply(f, args);
                const diff = (new Date()).getTime() -t1; //process.hrtime(t1);
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

        const super__ca_prepare__ =
                myUtils.superiorPromisify(that, '__ca_prepare__');
        that.__ca_prepare__ = async function() {
            try {
                const data = await super__ca_prepare__();
                const lA = data.logActions || [];
                // do not checkpoint rendered pages, too expensive...
                data.logActions = lA.filter(x => (x.method !== 'renderImpl'));
                if (data.logActions.length === 0) {
                    delete data.logActions;
                }
                return [null, data];
            } catch (err) {
                return [err];
            }
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
