import editpage from "./edit.html"
export class TranslateDbEditPageHandler implements RequestHandler{
    url_re: RegExp;
    constructor(){
        this.url_re = new RegExp("https?://[^/]+/json_edit/[0-9]+$")
    }
    urlMatch(url: string): boolean {
        console.log(url)
        return !!this.url_re.exec(url)
    }

    async response(request: Request, env: Env, ctx: ExecutionContext<unknown>): Promise<Response> {
        console.log(2)
        return new Response(editpage, {
            headers:{
                "content-type":"text/html"
            }
        })
    }
}
