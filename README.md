### think-cors

    参考express-cors编写的thinkjs的cors插件
    
    
    在阅读express-cors的代码逻辑过程中,感觉给的设置的自由度太大,反而显得累赘,
    比如methods的设置同时支持"GET,POST",和数组的设置["GET","POST"],
    不如只支持string好了,功能是要考虑周到的,但输出给用户的方式需要简单唯一的,支持的多了反而凌乱了.
    所以去掉了数组的方式
    
    
    
### 设置解析及相关说明


可默认不设置(取默认值),或 设置为如下的全量设置

----------
    
cors的默认参数
    
    defaults = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false 
    };
    
    
cors的全量设置:
    
    {
        origin:"*",  //Access-Control-Allow-Origin
        methods:"GET,POST",   //Access-Control-Allow-Methods 
        credentials:true,//Access-Control-Allow-Credentials
        allowedHeaders:"x-token,x-uid",//Access-Control-Allow-Headers
        exposedHeaders:"xx,yy",//Access-Control-Expose-Headers
        maxAge:1000,//Access-Control-Max-Age
        preflightContinue:true  
    }
 


####origin  

    1- 不设置,取默认值为 "*" 
    2- 为特定的字符url
    3- true/false
    4- 为数组
    
    
分为简单和复杂两种

简单:单一值的设置

    - 不设置(取默认值)
    - 设置为具体字符:"*" 或 具体的url地址
    - true/false  
      true标示任何请求都允许,由于*的设置与credentials为true时的不能同时设置,如果设置为true会填充为请求头Request中的origin
      false 标示不允许任何
        
复杂:采取匹配的方式的设置
    
    数据对象,元素为字符,正则,(function暂不加,后继有复杂设置不能满足的场景,再进行增加),比如:

    origin:[
        "http://abc.com",
      /^http\:\/\/(.+\.)?thinkjs.org$/
    ]
        
        
        
        
        
        
    
####methods 
   
    1- 不设置,取默认值
    2- 字符串,如: method:"GET,POST"
    
    

####credentials
    
    1- 不设置,取默认值
    2- 设置为 true/false


####allowedHeaders  
    1- 不设置,取request的access-control-request-headers值
    2- 字符串,如:"x-token,x-uid"


####exposedHeaders
    1- 不设置
    2- 字符串,如:"x-token,x-uid"


####maxAge  (用于options预检请求)

    1- 不设置
    2- 设置为秒数   

    
### 测试用例

    根据每个值的设置方式进行测试
    
    
#### 关于OPTIONS请求

    OPTIONS请求方法的主要用途有两个：
    
    1、获取服务器支持的HTTP请求方法；
    2、用来检查服务器的性能。例如：AJAX进行跨域请求时的预检，
    需要向另外一个域名的资源发送一个HTTP OPTIONS请求头，用以判断实际发送的请求是否安全。
    
    
    在ajax进行跨域请求时就会自动先发出OPTIONS请求进行预捡,如果不对OPTIONS请求进行处理,
    在API不支持跨域时,会提示预检错误,不再发送后继的POST,GET的请求,在服务器支持CORS跨域时,
    如果不对OPTIONS做返回的处理,服务器会对该请求返回一些内容,会触发请求回调,后继继续发送POST,GET请求.
    
    express的cors插件通过preflightContinue对OPTIONS划分了两种处理方式(在支持cors跨域时):
    当参数为true:会继续提交给接口进行接口层面的返回, 当参数为false:直接返回HTTP Stauts 204.
    
    OPTIONS在预检cors权限时,每次都会发送,而且每次的处理作用都是一样的,所以可以对OPTIONS的请求在第一次访问后进行缓存,
    这样重复的OPTIONS请求会从缓存中提取,提高请求性能.
    
    
    

    
### 请求头说明(来源于网络) [跨域资源共享CORS安全性浅析](http://netsecurity.51cto.com/art/201311/419179.htm)
                    
   
    Access-Control-Allow-Origin: 允许跨域访问的域，可以是一个域的列表，也可以是通配符"*"。这里要注意Origin规则只对域名有效，并不会对子目录有效。即http://foo.example/subdir/ 是无效的。但是不同子域名需要分开设置，这里的规则可以参照同源策略
    Access-Control-Allow-Credentials: 是否允许请求带有验证信息，这部分将会在下面详细解释
    Access-Control-Expose-Headers: 允许脚本访问的返回头，请求成功后，脚本可以在XMLHttpRequest中访问这些头的信息(貌似webkit没有实现这个)
    Access-Control-Max-Age: 缓存此次请求的秒数。在这个时间范围内，所有同类型的请求都将不再发送预检请求而是直接使用此次返回的头作为判断依据，非常有用，大幅优化请求次数
    Access-Control-Allow-Methods: 允许使用的请求方法，以逗号隔开
    Access-Control-Allow-Headers: 允许自定义的头部，以逗号隔开，大小写不敏感


    
