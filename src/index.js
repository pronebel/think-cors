'use strict';

var vary = require('vary');

var defaults = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false
};
/**
 * middleware
 */
export default class extends think.middleware.base {


    isString(s) {
        return typeof s === 'string' || s instanceof String;
    }

    /**
     * 检查给出的origin是否在允许
     * @param origin
     * @param allowedOrigin
     * @returns {boolean}
     */
    isOriginAllowed(origin, allowedOrigin) {
        if (Array.isArray(allowedOrigin)) {
            allowedOrigin.forEach((originItem)=>{
                if (this.isOriginAllowed(origin, originItem)) {
                    return true;
                }
            })

            return false;
        } else if (this.isString(allowedOrigin)) {
            return origin === allowedOrigin;
        } else if (allowedOrigin instanceof RegExp) {
            return allowedOrigin.test(origin);
        } else {
            return !!allowedOrigin;
        }
    }

    /**
     * 根据req的请求,返回Access-Control-Allow-Origin的配置
     * @param options
     * @param req
     * @returns {Array}
     */
    configureOrigin(options, req) {
        var requestOrigin = req.headers.origin,
            headers = [],
            isAllowed;

        if (!options.origin || options.origin === '*') {
            // allow any origin
            headers.push([{
                key: 'Access-Control-Allow-Origin',
                value: '*'
            }]);
        } else if (this.isString(options.origin)) {
            // fixed origin
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
            // reflect origin
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
    }

    /**
     * 根据config配置Access-Control-Allow-Methods
     * @param options
     * @returns {{key: string, value: (Array|string)}}
     */
    configureMethods(options) {
        var methods = options.methods || defaults.methods;
        if (methods.join) {
            methods = options.methods.join(','); // .methods is an array, so turn it into a string
        }
        return {
            key: 'Access-Control-Allow-Methods',
            value: methods
        };
    }

    /**
     * 配置Access-Control-Allow-Credentials
     * @param options
     * @returns {*}
     */
    configureCredentials(options) {
        if (options.credentials === true) {
            return {
                key: 'Access-Control-Allow-Credentials',
                value: 'true'
            };
        }
        return null;
    }

    /**
     * 配置 access-control-request-headers
     * @param options
     * @param req
     * @returns {*}
     */
    configureAllowedHeaders(options, req) {
        var headers = options.allowedHeaders || options.headers;
        if (!headers) {
            headers = req.headers['access-control-request-headers']; // .headers wasn't specified, so reflect the request headers
        } else if (headers.join) {
            headers = headers.join(','); // .headers is an array, so turn it into a string
        }
        if (headers && headers.length) {
            return {
                key: 'Access-Control-Allow-Headers',
                value: headers
            };
        }
        return null;
    }

    /**
     * 配置 Access-Control-Expose-Headers
     * @param options
     * @returns {*}
     */
    configureExposedHeaders(options) {
        var headers = options.exposedHeaders;
        if (!headers) {
            return null;
        } else if (headers.join) {
            headers = headers.join(','); // .headers is an array, so turn it into a string
        }
        if (headers && headers.length) {
            return {
                key: 'Access-Control-Expose-Headers',
                value: headers
            };
        }
        return null;
    }

    /**
     * 配置 Access-Control-Max-Age
     * @param options
     * @returns {*}
     */
    configureMaxAge(options) {
        var maxAge = options.maxAge && options.maxAge.toString();
        if (maxAge && maxAge.length) {
            return {
                key: 'Access-Control-Max-Age',
                value: maxAge
            };
        }
        return null;
    }

    /**
     * setHeader
     * @param headers
     * @param res
     */
    applyHeaders(headers, res) {

        headers.forEach(header=>{
            if (header) {
                if (Array.isArray(header)) {
                    this.applyHeaders(header, res);
                } else if (header.key === 'Vary' && header.value) {
                    vary(res, header.value);
                } else if (header.value) {
                    res.setHeader(header.key, header.value);
                }
            }
        })


    }



    configureOptions(opts){

        // if no options were passed in, use the defaults
        if (!opts || opts === true) {
            opts = {};
        }

        opts.origin = opts.origin || defaults.origin;
        opts.methods = opts.methods || defaults.methods;
        opts.preflightContinue =  opts.preflightContinue  || defaults.preflightContinue;

        return opts;
    }


    /**
     * run
     * @return {} []
     */
    run() {

        //console.log("d~~~~~~~~~~~~~~~d");

        let req = this.http.req;
        let res = this.http.res;


        var options = this.config('cors');
        console.log(options);
        options = this.configureOptions(options);



        var headers = [],
            method = req.method && req.method.toUpperCase && req.method.toUpperCase();

        console.log(method);
        //OPTIONS请求
        if (method === 'OPTIONS') {
            // preflight
            headers.push(this.configureOrigin(options, req));
            headers.push(this.configureCredentials(options, req));
            headers.push(this.configureMethods(options, req));
            headers.push(this.configureAllowedHeaders(options, req));
            headers.push(this.configureMaxAge(options, req));
            headers.push(this.configureExposedHeaders(options, req));
            this.applyHeaders(headers, res);

            console.log(headers);
            if (options.preflightContinue ) {
                //console.log("~~~~~options_going");
                return;
            } else {

                //console.log("~~~~~options_break");

                res.statusCode = 204;
                res.end();
                return;
            }
        } else {
            //console.log("~~~~~acting_going");
            //实际的请求
            // actual response
            headers.push(this.configureOrigin(options, req));
            headers.push(this.configureCredentials(options, req));
            headers.push(this.configureExposedHeaders(options, req));
            this.applyHeaders(headers, res);
            return;
        }
    }
}