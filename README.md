
# Usage   [中文文档](README.CN.md)

First, please reader the doc about the [Middleware](https://thinkjs.org/zh-cn/doc/2.1/middleware.html) in thinkjs.org

Then, config  as follows:

###### npm install think-cors

###### src/commom/bootstrap/middleware.js：

    var cors = require("think-cors");
    think.middleware("cors", cors);
    
###### src/commom/config/config.js：

    export default {
        cors:{
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false 
        }
    };
    
###### src/commom/config/hook.js：

    export default {
        request_begin: ['cors']
    }


    
    
# docs


    
### the default config:
    
    {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false 
    };
    
    
### the detail props of config:
    
    {
        origin:"*",                         //Access-Control-Allow-Origin
        methods:"GET,POST",                 //Access-Control-Allow-Methods 
        credentials:true,                   //Access-Control-Allow-Credentials
        allowedHeaders:"x-token,x-uid",     //Access-Control-Allow-Headers
        exposedHeaders:"xx,yy",             //Access-Control-Expose-Headers
        maxAge:1000,                        //Access-Control-Max-Age
        preflightContinue:true  
    }
 
###  Config Item 

#### origin  

simple config:

    {
        origin:"*"
    }

-

    {
        origin:"http://youdomain.com"
    }

-

    {
        origin:true  //  set the origin header as yours request domain
    }
 
-
    
    {
            origin:false  // disabled cors
    }
        
 
###### complex config:

    {
        origin:[
            
            "http://youdomain.cn",
            
            /^http\:\/\/(.+\.)?thinkjs.org$/
        
        ]
    
    }
    

        
    
####methods 
   
    1- default as  'GET,HEAD,PUT,PATCH,POST,DELETE'
    2- set as yours method :
        
        {
            method:'GET,POST'
        }
    
    

#### credentials
    
    1- default as false
    2- set as:
        {
            credentials: true // true or false
        }
        


#### allowedHeaders  
    1- default set as  the value of "access-control-request-headers"
    2- set as a string :
        {
            allowedHeaders:"x-token,x-uid"
        }

#### exposedHeaders

    1- default as null
    2- set as a string :
       {
           exposedHeaders:"x-token,x-uid"
       }


#### maxAge  (set for the OPTIONS)

    1- default as null
    2- set the OPTIONS request senconds:
    
        {
            maxAge: 1000//  1000 seconds
        }


    
  
    
    
    



    
