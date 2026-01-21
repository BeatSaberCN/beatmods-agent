interface RequestHandler{
    urlMatch(url:string):boolean
    response(request:Request, env:Env, ctx:ExecutionContext<unknown>):Promise<Response>
}