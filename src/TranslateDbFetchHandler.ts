import { TranslateDBItem } from "./TranslateDB";

export class TranslateDbFetchHandler implements RequestHandler{
    url_re: RegExp;
    constructor(){
        this.url_re = new RegExp("https?://[^/]+/tapi/inlinedb/([0-9]+)$")
    }
    urlMatch(url: string): boolean {
        return !! this.url_re.exec(url)
    }
    async response(request: Request, env: Env, ctx: ExecutionContext<unknown>): Promise<Response> {
        const mod_id = + (this.url_re.exec(request.url))![1]
        const dbItem = await TranslateDBItem.findItem({
            id: mod_id,
            name:null,
            summary:null,
            description:null,
            authors:[]
        })
        if(dbItem == undefined){
            return new Response("Mod not found", {
                status: 404
            })
        }

        return new Response(JSON.stringify(dbItem), {
            headers:{
                "content-type":"application/json"
            }
        })
    }


}