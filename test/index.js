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


 var assertRes = function(resHeader,target){

     for(var key in target){
         console.log(resHeader[key]);
         if(!_.isEqual(target[key],resHeader[key])){
             return false
         }
     }


     return true;
 }


describe('cors', function(){
    //



    it('cors不设置', function(done){
        execMiddleware({_config: {}},"OPTIONS").then(function(data){

            console.log(data);

           // 'access-control-allow-methods': ''

            var origin = data["_headers"]['access-control-allow-origin'];
            var methods = data["_headers"]['access-control-allow-methods'];


            assert.equal(origin,'*');
            assert.equal(methods,'GET,HEAD,PUT,PATCH,POST2,DELETE');
            done();
        }).catch(function(e) {
            done(e);
        })
    })
    /*it('array, not match', function(done){
        execMiddleware({_config: {
            ip_filter: ['10.0.0.1']
        }}).then(function(data){
            assert.equal(data, undefined);
            done();
        })
    })
    it('array, not match, with *', function(done){
        execMiddleware({_config: {
            ip_filter: ['10.*.*.1']
        }}).then(function(data){
            assert.equal(data, undefined);
            done();
        })
    })
    it('array, match', function(done){
        var statusAction = think.statusAction;
        think.statusAction = function(status, http){
            assert.equal(status, 403);
            return Promise.reject(new Error());
        }
        execMiddleware({_config: {
            ip_filter: ['10.0.0.1']
        }, ip: function(){
            return '10.0.0.1'
        }}).catch(function(err){
            think.statusAction = statusAction;
            done();
        })
    })
    it('array, match, with *', function(done){
        var statusAction = think.statusAction;
        think.statusAction = function(status, http){
            assert.equal(status, 403);
            return Promise.reject(new Error());
        }
        execMiddleware({_config: {
            ip_filter: ['10.*']
        }, ip: function(){
            return '10.0.0.1'
        }}).catch(function(err){
            think.statusAction = statusAction;
            done();
        })
    })
    it('array, match, regexp', function(done){
        var statusAction = think.statusAction;
        think.statusAction = function(status, http){
            assert.equal(status, 403);
            return Promise.reject(new Error());
        }
        execMiddleware({_config: {
            ip_filter: [/^10/]
        }, ip: function(){
            return '10.0.0.1'
        }}).catch(function(err){
            think.statusAction = statusAction;
            done();
        })
    })
    it('array, match, blackList regexp', function(done){
        var statusAction = think.statusAction;
        think.statusAction = function(status, http){
            assert.equal(status, 403);
            return Promise.reject(new Error());
        }
        execMiddleware({_config: {
            ip_filter: {blackList: /^10/}
        }, ip: function(){
            return '10.0.0.1'
        }}).catch(function(err){
            think.statusAction = statusAction;
            done();
        })
    })
    it('array, match, whiteList regexp', function(done){
        execMiddleware({_config: {
            ip_filter: {whiteList: /^10/}
        }, ip: function(){
            return '10.0.0.1'
        }}).then(function(data){
            assert.equal(data, undefined)
            done();
        })
    })
    it('array, match, whiteList regexp, blackList', function(done){
        execMiddleware({_config: {
            ip_filter: {whiteList: /^10/, blackList: /^10/}
        }, ip: function(){
            return '10.0.0.1'
        }}).then(function(data){
            assert.equal(data, undefined)
            done();
        })
    })
    it('array, no whiteList & blackList rules', function(done){
        execMiddleware({_config: {
            ip_filter: {xxx: /^10/}
        }, ip: function(){
            return '10.0.0.1'
        }}).then(function(data){
            assert.equal(data, undefined)
            done();
        })
    })
    it('array, not match, whiteList regexp', function(done){
        var statusAction = think.statusAction;
        think.statusAction = function(status, http){
            assert.equal(status, 403);
            return Promise.reject(new Error());
        }
        execMiddleware({_config: {
            ip_filter: {whiteList: /^10/}
        }, ip: function(){
            return '110.0.0.1'
        }}).catch(function(err){
            think.statusAction = statusAction;
            done();
        })
    })
    it('function, return empty', function(done){
        execMiddleware({
            _config: {
                ip_filter: function(){return }
            }
        }).then(function(data){
            assert.equal(data, undefined)
            done();
        })
    })
    it('function, return empty array', function(done){
        execMiddleware({
            _config: {
                ip_filter: function(){return []}
            }
        }).then(function(data){
            assert.equal(data, undefined)
            done();
        })
    })*/
})