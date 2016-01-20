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


            for(let i=0;i<allowedOrigin.length;i++){

                let originItem = allowedOrigin[i];

                if (this.isString(originItem)&&(origin === originItem)) {
                    return true;
                } else if (originItem instanceof RegExp  &&(originItem.test(origin))) {
                    return true;
                }
            }

            return false;


        }else {//true/false的情况
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

        if (options.origin === '*') {
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

            //console.log(requestOrigin);
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
        var methods = options.methods;
        if (methods.join) {
            methods = options.methods.join(',');
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
        var headers = options.allowedHeaders;
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


    }





    /**
     * run
     * @return {} []
     */
    run() {


        let [req,res,cofingCors] = [this.http.req, this.http.res,(this.config('cors') || {})];
        let  method = req.method && req.method.toUpperCase && req.method.toUpperCase();

        var options =  Object.assign({},defaults,cofingCors);


        //console.log(JSON.stringify(options));


        var headers = [
            this.configureOrigin(options, req),
            this.configureCredentials(options, req),
            this.configureExposedHeaders(options, req)

        ];


        //console.log("header");
        //console.log(JSON.stringify(headers));


        if (method === 'OPTIONS') {

            headers.push(this.configureMethods(options, req));
            headers.push(this.configureAllowedHeaders(options, req));
            headers.push(this.configureMaxAge(options, req));

            this.applyHeaders(headers, res);

            if (options.preflightContinue ) {
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
    }
}