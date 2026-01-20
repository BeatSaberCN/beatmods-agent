/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { ModsRewriter, SingleModRewriter } from "./BeatModsRewriters/ModRewriters";
import { FrontendHandler, ProxyHandler, RedirectHandler } from "./ProxyHandler";

const MY_PREFIX = "^https?://[^/]+/api"
const REMOTE_SERVER = "https://beatmods.com/api"

const handlers = [
    new FrontendHandler(new RegExp("(https?://[^/]+/)front/(_app/.*)$"),   "$1$2"),
    new FrontendHandler(new RegExp("(https?://[^/]+/)front/(user/.*)$"),   "$1$2"),
    new FrontendHandler(new RegExp("(https?://[^/]+/)front/(mods)$"),   "$1$2"),
    new FrontendHandler(new RegExp("(https?://[^/]+/)front/(mods/.*)$"),   "$1$2"),

    new RedirectHandler(new RegExp("https?://[^/]+/cdn/icon/(.*)$"),   "https://beatmods.com/cdn/icon/$1"),
    new RedirectHandler(new RegExp("https?://[^/]+/cdn/mod/(.*)$"),    "https://beatmods.com/cdn/mod/$1"),

    new ProxyHandler(new RegExp(MY_PREFIX +"/bbmStatusForBbmAlsoPinkEraAndLillieAreCuteBtwWilliamGay$"),      REMOTE_SERVER + "/bbmStatusForBbmAlsoPinkEraAndLillieAreCuteBtwWilliamGay"),
    new ProxyHandler(new RegExp(MY_PREFIX +"/modversions/(.*)$"),          REMOTE_SERVER + "/modversions/$1"),
    new ProxyHandler(new RegExp(MY_PREFIX +"/multi/modversions(.*)$"),     REMOTE_SERVER + "/multi/modversions$1"),
    new ProxyHandler(new RegExp(MY_PREFIX +"/hashlookup(.*)$"),            REMOTE_SERVER + "/hashlookup$1"),
    new ProxyHandler(new RegExp(MY_PREFIX +"/edits(.*)$"),                 REMOTE_SERVER + "/edits$1"),
    // new ProxyHandler(new RegExp(MY_PREFIX +"/edits/(.*)$"),             REMOTE_SERVER + "/edits/$1"),

    new ProxyHandler(new RegExp(MY_PREFIX +"/status$"),                    REMOTE_SERVER + "/status"),
    new ProxyHandler(new RegExp(MY_PREFIX +"/mods(\\?.*)?$"),              REMOTE_SERVER + "/mods$1"                 , new ModsRewriter()).with_cache(),
    new ProxyHandler(new RegExp(MY_PREFIX +"/mods/(.*)$"),                 REMOTE_SERVER + "/mods/$1"                , new SingleModRewriter()).with_cache(),


    new ProxyHandler(new RegExp(MY_PREFIX +"/games(.*)$"),                 REMOTE_SERVER + "/games$1"),
    new ProxyHandler(new RegExp(MY_PREFIX +"/versions(.*)$"),              REMOTE_SERVER + "/versions$1"),
    new ProxyHandler(new RegExp(MY_PREFIX +"/versions/default(.*)$"),      REMOTE_SERVER + "/versions/default$1"),
    new ProxyHandler(new RegExp(MY_PREFIX +"/motd(.*)$"),                  REMOTE_SERVER + "/motd$1"),



    new ProxyHandler(new RegExp(MY_PREFIX +"/user(.*)$"),                  REMOTE_SERVER + "/user$1"),
    // new ProxyHandler(new RegExp(MY_PREFIX +"/user/(.*)$"),              REMOTE_SERVER + "/user/$1"),
    new ProxyHandler(new RegExp(MY_PREFIX +"/users(.*)$"),                 REMOTE_SERVER + "/users$1"),
]

export default {
    async fetch(request, env, ctx): Promise<Response> {
        const url = new URL(request.url)
        if (url.pathname === "/robots.txt"){
            return new Response("User-agent: *\nDisallow: /", {
                headers: {
                    "content-type": "text/plain"
                }
            })
        }

        for(const handler of handlers){
            if(handler.urlMatch(request.url)){
                return handler.response(request, env, ctx)
            }
        }
        return new Response("Page not found",{
            status: 404
        });
    },
} satisfies ExportedHandler<Env>;
