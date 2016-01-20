'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

exports.__esModule = true;
var vary = require('vary');

var defaults = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false
};

var _default = (function (_think$middleware$base) {
    _inherits(_default, _think$middleware$base);

    function _default() {
        _classCallCheck(this, _default);

        _think$middleware$base.apply(this, arguments);
    }

    _default.prototype.isString = function isString(s) {
        return typeof s === 'string' || s instanceof String;
    };

    _default.prototype.isOriginAllowed = function isOriginAllowed(origin, allowedOrigin) {
        if (Array.isArray(allowedOrigin)) {

            for (var i = 0; i < allowedOrigin.length; i++) {

                var originItem = allowedOrigin[i];

                if (this.isString(originItem) && origin === originItem) {
                    return true;
                } else if (originItem instanceof RegExp && originItem.test(origin)) {
                    return true;
                }
            }

            return false;
        } else {
            return !!allowedOrigin;
        }
    };

    _default.prototype.setOrigin = function setOrigin(options, req) {

        var requestOrigin = req.headers.origin,
            headers = [],
            isAllowed;

        if (options.origin === '*') {

            headers.push([{
                key: 'Access-Control-Allow-Origin',
                value: '*'
            }]);
        } else if (this.isString(options.origin)) {

            headers.push([{
                key: 'Access-Control-Allow-Origin',
                value: options.origin
            }]);
            headers.push([{
                key: 'Vary',
                value: 'Origin'
            }]);
        } else {
            isAllowed = this.isOriginAllowed(requestOrigin, options.origin);

            headers.push([{
                key: 'Access-Control-Allow-Origin',
                value: isAllowed ? requestOrigin : false
            }]);
            if (isAllowed) {
                headers.push([{
                    key: 'Vary',
                    value: 'Origin'
                }]);
            }
        }

        return headers;
    };

    _default.prototype.setMethods = function setMethods(options) {
        var methods = options.methods;

        if (methods) {
            return {
                key: 'Access-Control-Allow-Methods',
                value: methods
            };
        } else {
            return null;
        }
    };

    _default.prototype.setCredentials = function setCredentials(options) {
        if (options.credentials === true) {
            return {
                key: 'Access-Control-Allow-Credentials',
                value: 'true'
            };
        } else {
            return null;
        }
    };

    _default.prototype.setAllowed = function setAllowed(options, req) {
        var headers = options.allowedHeaders;
        if (!headers) {
            headers = req.headers['access-control-request-headers'];
        }
        if (headers && headers.length) {
            return {
                key: 'Access-Control-Allow-Headers',
                value: headers
            };
        } else {
            return null;
        }
    };

    _default.prototype.setExposed = function setExposed(options) {
        var headers = options.exposedHeaders;

        if (headers && headers.length) {
            return {
                key: 'Access-Control-Expose-Headers',
                value: headers
            };
        } else {
            return null;
        }
    };

    _default.prototype.setMaxAge = function setMaxAge(options) {
        var maxAge = options.maxAge && options.maxAge.toString();
        if (maxAge && maxAge.length) {
            return {
                key: 'Access-Control-Max-Age',
                value: maxAge
            };
        } else {
            return null;
        }
    };

    _default.prototype.applyHeaders = function applyHeaders(headers, res) {

        for (var i = 0, n = headers.length; i < n; i++) {
            var header = headers[i];
            if (header) {
                if (Array.isArray(header)) {
                    this.applyHeaders(header, res);
                } else if (header.key === 'Vary' && header.value) {
                    //console.log(header);
                    vary(res, header.value);
                } else if (header.value) {
                    //console.log(header);
                    res.setHeader(header.key, header.value);
                }
            }
        }
    };

    _default.prototype.run = function run() {
        var req = this.http.req;
        var res = this.http.res;
        var cofingCors = this.config('cors') || {};

        var method = req.method && req.method.toUpperCase && req.method.toUpperCase();

        var options = _Object$assign({}, defaults, cofingCors);

        var headers = [this.setOrigin(options, req), this.setCredentials(options, req), this.setExposed(options, req), this.setMethods(options, req), this.setMaxAge(options, req)];

        if (method === 'OPTIONS') {

            this.applyHeaders(headers, res);

            if (options.preflightContinue) {
                return;
            } else {
                res.statusCode = 204;
                res.end();
                return;
            }
        } else {
            this.applyHeaders(headers, res);
            return;
        }
    };

    return _default;
})(think.middleware.base);

exports['default'] = _default;
module.exports = exports['default'];