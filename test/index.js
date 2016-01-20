var assert = require('assert');
var fs = require('fs');
var http = require('http');
var thinkjs = require('thinkjs');
var instance = new thinkjs();
instance.load();

var Middleware = require('../lib/index.js');

/**
 * 模拟请求(可以配置各种属性)
 */
var getHttp = function(options,method){
    var req = new http.IncomingMessage();
    req.headers = {
        'origin':"http://www.thinkjs.org",
        'host': 'www.thinkjs.org',
        "access-control-request-headers":"accept,x-token,x-user-id",
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit',
    };
    req.method = method.toUpperCase() || "GET";
    req.httpVersion = '1.1';
    req.url = '/index/index';
    var res = new http.ServerResponse(req);
    res.write = function(){
        return true;
    }

    return think.http(req, res).then(function(http){


        if(options){
            for(var key in options){
                http[key] = options[key];
            }
        }
        return http;
    })
}

/**
 * 执行中间件
 * @param options
 * @param method
 * @returns {*}
 */
var execMiddleware = function(options,method){
    return getHttp(options,method).then(function(http){

        var instance = new Middleware(http);
        instance.run();
        return http.res;
    })
}


var execMiddleware2 = function(options,method){
    return getHttp(options,method).then(function(http){

        var instance = new Middleware(http);
        instance.run();
        http.res.statusCode = 200;
        http.res.end();
        return http.res;
    })
}





describe('cors', function(){
    //



    it('config empty ', function(done){
        execMiddleware({_config: {}},"OPTIONS").then(function(data){


            var origin = data["_headers"]['access-control-allow-origin'];
            var methods = data["_headers"]['access-control-allow-methods'];
            var status = data["statusCode"];
            try {
                assert.equal(origin,'*');
                assert.equal(methods,'GET,HEAD,PUT,PATCH,POST,DELETE');
                assert.equal(status,204);
                done();
            } catch (x) {
                done(x);
            }


        })
    })

    it('origin=true', function(done){

        var data =  {
            cors:{
                origin:true
            }
        }

        execMiddleware2({_config:data},"GET").then(function(data){

            var origin = data["_headers"]['access-control-allow-origin'];

            try {
                assert.equal(origin,'http://www.thinkjs.org');
                done();
            } catch (x) {
                done(x);
            }
        })
    })
    it('origin=false', function(done){

        var data =  {
            cors:{
                origin:false
            }
        }

        execMiddleware2({_config:data},"GET").then(function(data){

            var origin;
            if(data["_headers"]){
                origin = data["_headers"]['access-control-allow-origin'];
            }

            try {
                assert.equal(origin,undefined);
                done();
            } catch (x) {
                done(x);
            }
        })
    })

    it('origin=string array', function(done){

        var data =  {
            cors:{
                origin:["http://www.baidu.com",'http://www.thinkjs.org']
            }
        }

        execMiddleware2({_config:data},"OPTIONS").then(function(data){



            try {
                var origin ;
                if(data["_headers"]){
                    origin = data["_headers"]['access-control-allow-origin'];
                }

                assert.equal(origin,'http://www.thinkjs.org');
                done();
            } catch (x) {
                done(x);
            }
        })
    })

    it('origin=regex array', function(done){

        var thinkjsReg = /^http\:\/\/\D{1,}.thinkjs.org/gi;
        var data =  {
            cors:{
                origin:["http://www.baidu.com",thinkjsReg]
            }
        }

        execMiddleware2({_config:data},"GET").then(function(data){



            try {
                var origin ;
                console.log(data);
                if(data["_headers"]){
                    origin = data["_headers"]['access-control-allow-origin'];
                }

                assert.equal(origin,'http://www.thinkjs.org');
                done();
            } catch (x) {
                done(x);
            }
        })
    })


    it('method=string ', function(done){


        var data =  {
            cors:{
                methods:'GET,POST'
            }
        }
        execMiddleware({_config: data},"OPTIONS").then(function(data){


            var methods = data["_headers"]['access-control-allow-methods'];
            try {

                assert.equal(methods,'GET,POST');
                done();
            } catch (x) {
                done(x);
            }

        })
    })
    it('credentials=true', function(done){


        var data =  {
            cors:{
                credentials:true
            }
        }
        execMiddleware({_config: data},"OPTIONS").then(function(data){
            try {

                var methods = data["_headers"]['Access-Control-Allow-Credentials'.toLowerCase()];
                assert.equal(methods,'true');
                done();
            } catch (x) {
                done(x);
            }

        })
    })

    it('allowedHeaders default', function(done){


        execMiddleware({_config: {}},"OPTIONS").then(function(data){
            try {

                var methods = data["_headers"]['Access-Control-Allow-Headers'.toLowerCase()];

                assert.equal(methods,"accept,x-token,x-user-id");
                done();
            } catch (x) {
                done(x);
            }

        })
    })

    it('allowedHeaders="x-orange,x-apple"', function(done){

        var data =  {
            cors:{
                allowedHeaders:"x-orange,x-apple"
            }
        }
        execMiddleware({_config: data},"OPTIONS").then(function(data){
            try {

                var methods = data["_headers"]['Access-Control-Allow-Headers'.toLowerCase()];

                assert.equal(methods,"x-orange,x-apple");
                done();
            } catch (x) {
                done(x);
            }

        })
    })

    it('exposedHeaders default', function(done){


        execMiddleware({_config: {}},"OPTIONS").then(function(data){
            try {

                var methods ;
                if(data["_headers"]){
                    methods=data["_headers"]['Access-Control-Expose-Headers'.toLowerCase()];
                }

                assert.equal(methods,undefined);
                done();
            } catch (x) {
                done(x);
            }

        })
    })

    it('exposedHeaders="x-orange,x-apple"', function(done){

        var data =  {
            cors:{
                exposedHeaders:"x-orange,x-apple"
            }
        }
        execMiddleware({_config: data},"OPTIONS").then(function(data){
            try {

                var methods = data["_headers"]['Access-Control-Expose-Headers'.toLowerCase()];

                assert.equal(methods,"x-orange,x-apple");
                done();
            } catch (x) {
                done(x);
            }

        })
    })



    it('maxAge default', function(done){


        execMiddleware({_config: {}},"OPTIONS").then(function(data){
            try {

                var methods ;
                if(data["_headers"]){
                    methods=data["_headers"]['Access-Control-Max-Age'.toLowerCase()];
                }

                assert.equal(methods,undefined);
                done();
            } catch (x) {
                done(x);
            }

        })
    })
    it('maxAge=100', function(done){

        var data =  {
            cors:{
                maxAge:100
            }
        }
        execMiddleware({_config: data},"OPTIONS").then(function(data){
            try {

                var methods ;
                if(data["_headers"]){
                    methods=data["_headers"]['Access-Control-Max-Age'.toLowerCase()];
                }
                assert.equal(methods,"100");
                done();
            } catch (x) {
                done(x);
            }

        })
    })


})