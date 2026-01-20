import { Rewriter } from "./Rewriter"

function allowOrigin(origin:string){
    if(typeof(origin) != "string")
        return false
    if(origin.startsWith("http://localhost:"))
        return true
    return false
}

export class ProxyHandler{
    url_pattern:RegExp
    url_replace:string
    rewriter?:Rewriter

    cache_age:number

    constructor(url_pattern:RegExp, url_replace:string, rewriter?:Rewriter){
        this.url_pattern = url_pattern
        this.url_replace = url_replace
        this.rewriter = rewriter
        this.cache_age = 0
    }
    // 内存缓存，用于缓解json太大导致执行时间超过10ms限制的问题。同时跳过beatmods源，能有效提升访问速度。
    with_cache(age = 60 /* seconds */ * 60 /* minutes */ * 2 /* hours */){
        this.cache_age = age
        return this
    }

    urlMatch(url:string){
        return !!this.url_pattern.exec(url)
    }

    async response(req:Request, env:Env, ctx:ExecutionContext<unknown>):Promise<Response> {
        const forwarded_url = req.url.replace(this.url_pattern, this.url_replace)

        const cache = await caches.open("proxy-handler-cache")

        let cache_avaliable = true

        const cross_origin_header:any = {}
        const origin = req.headers.get("origin")

        
        if(origin){
            cache_avaliable = false
            if(allowOrigin(origin)){
                cross_origin_header["Access-Control-Allow-Origin"] = origin
                cross_origin_header["Access-Control-Allow-Credentials"] = "true"
            }else{
                console.warn("Origin is refused:", origin)
            }
        }

        if(req.method != "GET"){
            cache_avaliable = false
        }
        if(this.cache_age == 0)
            cache_avaliable = false

        if(cache_avaliable){
            const cached_resp = await cache.match(forwarded_url)
            if(cached_resp){
                console.log("cache hit!")
                return cached_resp
            }
        }

        const resp = await fetch(forwarded_url,{
            method: req.method,
            body: req.body,
            headers: {
                "Content-Type":req.headers.get("content-type") || "application/text",
                "User-Agent": "ModsMirror/1.0 (BeatSaberCN; +https://github.com/BeatSaberCN/beatmods-agent) "
            }
        })

        if(resp.status == 200){
            let rewritten_text = await resp.text();

            if(this.rewriter)
                rewritten_text = await this.rewriter.rewrite(req,env,ctx,rewritten_text)

            let response = new Response(rewritten_text, {
                headers: {
                    "content-type":resp.headers.get("content-type") || "application/text",
                    ...cross_origin_header,
                }
            })
            if(cache_avaliable){
                response.headers.append("Cache-Control", "s-maxage=" + this.cache_age)
                ctx.waitUntil(cache.put(forwarded_url, response.clone()))
            }

            return response
        }else{
            //just keep the server response
            return resp
        }

    }
}

export class RedirectHandler extends ProxyHandler{
    constructor(url_pattern:RegExp, url_replace:string, rewriter?:Rewriter){
        super(url_pattern, url_replace, rewriter)
    }

    async response(req:Request, env:Env, ctx:ExecutionContext<unknown>):Promise<Response> {
        const forwarded_url = req.url.replace(this.url_pattern, this.url_replace)

        return Response.redirect(forwarded_url, 301)
    }
}

export class FrontendHandler extends ProxyHandler{
    constructor(url_pattern:RegExp, url_replace:string, rewriter?:Rewriter){
        super(url_pattern, url_replace, rewriter)
    }

    async response(req:Request, env:Env, ctx:ExecutionContext<unknown>):Promise<Response> {
        const forwarded_url = req.url.replace(this.url_pattern, this.url_replace)
        return env.FRONTEND.fetch(forwarded_url)
    }
}