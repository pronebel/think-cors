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



    it('empty,default config', function(done){
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

    it('set origin=true', function(done){

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

    it('set origin=string array', function(done){

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

    it('set origin=regex array', function(done){

        var thinkjsReg = /^http\:\/\/\D{1,}.thinkjs.org/gi;
        var data =  {
            cors:{
                origin:["http://www.baidu.com",thinkjsReg]
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



})