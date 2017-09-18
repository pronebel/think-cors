'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

exports.__esModule = true;
var vary = require('vary');

/**
 * defaults config
 * @type {{origin: string, methods: string, preflightContinue: boolean}}
 */
var defaults = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    exclude: null
};

var _default = (function (_think$middleware$base) {
    _inherits(_default, _think$middleware$base);

    function _default() {
        _classCallCheck(this, _default);

        _think$middleware$base.apply(this, arguments);
    }

    /**
     * check the request is need cors (like: the websocket request is not need CORS)
     * @param url: 当前请求的url
     * @param urlList：规则列表，可以是 具体url，正则 的array，默认行为定义为
     * @returns {boolean}
     */

    _default.prototype.checkHttp = function checkHttp(urlList, url) {
        if (Array.isArray(urlList)) {
            for (var i = 0; i < urlList.length; i++) {
                var urlItem = urlList[i];
                if (this.isString(urlItem) && url.indexOf(urlItem) > -1) {
                    return true;
                } else if (urlItem instanceof RegExp && urlItem.test(url)) {
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    };

    /**
     * check is a string
     * @param s
     * @returns {boolean}
     */

    _default.prototype.isString = function isString(s) {
        return typeof s === 'string' || s instanceof String;
    };

    /**
     * check request.origin in allowedOrigin
     * @param origin
     * @param allowedOrigin
     * @returns {boolean}
     */

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

    /**
     * set Origin
     * @param options
     * @param req
     * @returns {Array}
     */

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

    /**
     * set Methods
     * @param options
     * @returns {*}
     */

    _default.prototype.setMethods = function setMethods(options) {
        var methods = options.methods;

        var retMethod = null;

        if (methods) {
            retMethod = {
                key: 'Access-Control-Allow-Methods',
                value: methods
            };
        }

        return retMethod;
    };

    /**
     * set Credentials
     * @param options
     * @returns {*}
     */

    _default.prototype.setCredentials = function setCredentials(options) {
        if (options.credentials === true) {
            return {
                key: 'Access-Control-Allow-Credentials',
                value: 'true'
            };
        }
        return null;
    };

    /**
     * set allow headers
     * @param options
     * @param req
     * @returns {*}
     */

    _default.prototype.setAllowed = function setAllowed(options, req) {
        var headers = options.allowedHeaders;

        var retAllow = null;

        if (!headers) {
            headers = req.headers['access-control-request-headers'];
        }
        if (headers && headers.length) {
            retAllow = {
                key: 'Access-Control-Allow-Headers',
                value: headers
            };
        }

        return retAllow;
    };

    /**
     * set expose headers
     * @param options
     * @param req
     * @returns {*}
     */

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

    /**
     * set request cache ,when request is OPTIONS
     * @param options
     * @returns {*}
     */

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

    /**
     * apply  the header change
     * @param headers
     * @param res
     */

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

    /**
     * middleware execute
     */

    _default.prototype.run = function run() {
        var req = this.http.req;
        var res = this.http.res;
        var cofingCors = this.config('cors') || {};

        var method = req.method && req.method.toUpperCase && req.method.toUpperCase();

        var options = _Object$assign({}, defaults, cofingCors);

        var excludeUrl = options.exclude;

        if (this.http.isAjax()) {
            return;
        }

        if (this.checkHttp(excludeUrl, this.http.url)) {
            return;
        }

        var headers = [this.setOrigin(options, req), this.setCredentials(options, req), this.setExposed(options, req), this.setMethods(options, req), this.setAllowed(options, req)];

        if (method === 'OPTIONS') {

            headers.push(this.setMaxAge(options, req));
            this.applyHeaders(headers, res);

            if (!options.preflightContinue) {
                res.statusCode = 204;
                res.end();
                return res.prevent();
            }
            return;
        } else {
            this.applyHeaders(headers, res);
            return;
        }
    };

    return _default;
})(think.middleware.base);

exports['default'] = _default;
module.exports = exports['default'];