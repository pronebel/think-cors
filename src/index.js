'use strict';

var vary = require('vary');

var defaults = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false
};

export default class extends think.middleware.base {


    isString(s) {
        return typeof s === 'string' || s instanceof String;
    }

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


    setMethods(options) {
        var methods = options.methods;

        if(methods){
            return {
                key: 'Access-Control-Allow-Methods',
                value: methods
            };
        }else{
            return null;
        }

    }


    setCredentials(options) {
        if (options.credentials === true) {
            return {
                key: 'Access-Control-Allow-Credentials',
                value: 'true'
            };
        }else{
            return null;
        }

    }


    setAllowed(options, req) {
        var headers = options.allowedHeaders;
        if (!headers) {
            headers = req.headers['access-control-request-headers'];
        }
        if (headers && headers.length) {
            return {
                key: 'Access-Control-Allow-Headers',
                value: headers
            };
        }else{
            return null;
        }

    }


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


    run() {


        let [req,res,cofingCors] = [this.http.req, this.http.res,(this.config('cors') || {})];
        let  method = req.method && req.method.toUpperCase && req.method.toUpperCase();

        var options =  Object.assign({},defaults,cofingCors);


        var headers = [
            this.setOrigin(options, req),
            this.setCredentials(options, req),
            this.setExposed(options, req),
            this.setMethods(options, req),
            this.setAllowed(options, req),


        ];

        if (method === 'OPTIONS') {


            this.setMaxAge(options, req)
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