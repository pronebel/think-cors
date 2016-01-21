'use strict';

var vary = require('vary');

/**
 * defaults config
 * @type {{origin: string, methods: string, preflightContinue: boolean}}
 */
var defaults = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false
};

export default class extends think.middleware.base {


    /**
     * check is a string
     * @param s
     * @returns {boolean}
     */
    isString(s) {
        return typeof s === 'string' || s instanceof String;
    }

    /**
     * check request.origin in allowedOrigin
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


        }else {
            return !!allowedOrigin;
        }
    }


    /**
     * set Origin
     * @param options
     * @param req
     * @returns {Array}
     */
    setOrigin(options, req) {

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
    }


    /**
     * set Methods
     * @param options
     * @returns {*}
     */
    setMethods(options) {
        var methods = options.methods;


        var retMethod = null;


        if(methods){
            retMethod= {
                key: 'Access-Control-Allow-Methods',
                value: methods
            };
        }

        return retMethod;

    }

    /**
     * set Credentials
     * @param options
     * @returns {*}
     */
    setCredentials(options) {
        if (options.credentials === true) {
            return {
                key: 'Access-Control-Allow-Credentials',
                value: 'true'
            };
        }
        return null;
    }


    /**
     * set allow headers
     * @param options
     * @param req
     * @returns {*}
     */
    setAllowed(options, req) {
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

    }

    /**
     * set expose headers
     * @param options
     * @param req
     * @returns {*}
     */
    setExposed(options) {
        var headers = options.exposedHeaders;

        if (headers && headers.length) {
            return {
                key: 'Access-Control-Expose-Headers',
                value: headers
            };
        }else{
            return null;
        }

    }


    /**
     * set request cache ,when request is OPTIONS
     * @param options
     * @returns {*}
     */
    setMaxAge(options) {
        var maxAge = options.maxAge && options.maxAge.toString();
        if (maxAge && maxAge.length) {
            return {
                key: 'Access-Control-Max-Age',
                value: maxAge
            };
        }else{
            return null;
        }

    }


    /**
     * apply  the header change
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
     * middleware execute
     */
    run() {


        let [req,res,cofingCors] = [this.http.req, this.http.res,(this.config('cors') || {})];
        let  method = req.method && req.method.toUpperCase && req.method.toUpperCase();

        var options =  Object.assign({},defaults,cofingCors);


        var headers = [
            this.setOrigin(options, req),
            this.setCredentials(options, req),
            this.setExposed(options, req),
            this.setMethods(options, req),
            this.setAllowed(options, req)


        ];

        if (method === 'OPTIONS') {


            headers.push(this.setMaxAge(options, req));
            this.applyHeaders(headers, res);

            if (!options.preflightContinue ) {
                res.statusCode = 204;
                res.end();
            }
            return;

        } else {
            this.applyHeaders(headers, res);
            return;
        }
    }
}