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
    constructor(url_pattern:RegExp, url_replace:string, rewriter?:Rewriter){
        this.url_pattern = url_pattern
        this.url_replace = url_replace
        this.rewriter = rewriter
    }

    urlMatch(url:string){
        return !!this.url_pattern.exec(url)
    }

    async response(req:Request, env:Env, ctx:ExecutionContext<unknown>):Promise<Response> {
        const forwarded_url = req.url.replace(this.url_pattern, this.url_replace)

        const resp = await fetch(forwarded_url,{
            method: req.method,
            body: req.body,
            headers: {
                "Content-Type":req.headers.get("content-type") || "application/text",
                "User-Agent": "ModsMirror/1.0 (BeatSaberCN; +https://github.com/BeatSaberCN/beatmods-agent) "
            }
        })

        const cross_origin_header:any = {}
        const origin = req.headers.get("origin")

        
        if(origin){
            if(allowOrigin(origin)){
                cross_origin_header["Access-Control-Allow-Origin"] = origin
                cross_origin_header["Access-Control-Allow-Credentials"] = "true"
            }else{
                console.warn("Origin is refused:", origin)
            }
        }

        if(resp.status == 200){
            if(this.rewriter){
                return new Response(await this.rewriter.rewrite(req, env, ctx, await resp.text()), {
                    headers: {
                        "content-type":resp.headers.get("content-type") || "application/text",
                        ...cross_origin_header
                    }
                })
            }else{
                return new Response(await resp.text(),{
                    headers: {
                        "content-type":resp.headers.get("content-type") || "application/text",
                        ...cross_origin_header
                    }
                })
            }
        }

        return new Response(await resp.text(), {
            status: resp.status, // this is for compat. beatmods uses the status code for error detect, we forward it.
            headers: {
                "content-type":resp.headers.get("content-type") || "",
                ...cross_origin_header
            }
        })
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