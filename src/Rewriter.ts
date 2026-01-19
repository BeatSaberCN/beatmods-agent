export interface Rewriter{
    /* this is an async function that returns the morphed input */
    rewrite(req:Request, env:Env, ctx:ExecutionContext<unknown>, input:string):Promise<string>
}


export abstract class JsonRewriter{

    abstract rewriteJson(input:any):Promise<any>

    async rewrite(req:Request, env:Env, ctx:ExecutionContext<unknown>, input:string):Promise<string>{
        if(input == "")
            return input
        try{
            const json = JSON.parse(input)
            return JSON.stringify(await this.rewriteJson(json))
        }catch(e){
            return input
        }
    }
}

// export class ModRewriter extends JsonRewriter{
//     async rewriteJson(input: any): Promise<any> {
//         return input
//     }
// }