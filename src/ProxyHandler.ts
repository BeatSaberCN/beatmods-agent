import { Rewriter } from "./Rewriter"

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

        if(resp.status == 200){
            if(this.rewriter){
                return new Response(await this.rewriter.rewrite(req, env, ctx, await resp.text()), {
                    headers: {
                        "content-type":resp.headers.get("content-type") || "application/text"
                    }
                })
            }else{
                return new Response(await resp.text(),{
                    headers: {
                        "content-type":resp.headers.get("content-type") || "application/text"
                    }
                })
            }
        }

        return new Response(await resp.text(), {
            status: resp.status, // this is for compat. beatmods uses the status code for error detect, we forward it.
            headers: {
                "content-type":resp.headers.get("content-type") || ""
            }
        })
    }
}
