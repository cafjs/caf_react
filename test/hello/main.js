var caf_core = require('caf_core');

exports.load = function($, spec, name, modules, cb) {
    modules = modules || [];
    modules.push(module);
    caf_core.init(modules, spec, name, cb);
};
