### think-cors

    从express的cors插件中提取出来的thinkjs的cors插件
    
    
### 对express的cors插件解析及对cors相关理解的说明
    
cors的默认参数
    
    defaults = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false 
    };
    
    
 methods: 
    该参数的定义使用过RESTFUL接口规范的同学应该都熟悉,这里需要提一下OPTIONS方法.
    
    OPTIONS请求方法的主要用途有两个：
    
    1、获取服务器支持的HTTP请求方法；
    2、用来检查服务器的性能。例如：AJAX进行跨域请求时的预检，需要向另外一个域名的资源发送一个HTTP OPTIONS请求头，用以判断实际发送的请求是否安全。
    
    
    在ajax进行跨域请求时就会自动先发出OPTIONS请求进行预捡,如果不对OPTIONS请求进行处理,
    在API不支持跨域时,会提示预检错误,不再发送后继的POST,GET的请求,在服务器支持CORS跨域时,
    如果不对OPTIONS做返回的处理,服务器会对该请求返回一些内容,会出发请求回调,后继继续发送POST,GET请求.
    
    express的cors插件通过preflightContinue对OPTIONS划分了两种处理方式(在支持cors跨域时):
    当参数为true:会继续提交给接口进行接口层面的返回,
    当参数为false:直接返回HTTP Stauts 204.
    
    OPTIONS在预检cors权限时,每次都会发送,而且每次的处理作用都是一样的,所以可以对OPTIONS的请求在第一次访问后进行缓存,
    这样重复的OPTIONS请求会从缓存中提取,提高请求性能.
    
    
    
    
    
    
    
    
    
### 测试用例
    
    
    