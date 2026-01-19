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
import { ProxyHandler } from "./ProxyHandler";

const MY_PREFIX = "^https?://[^/]+/api"
const REMOTE_SERVER = "https://beatmods.com/api"

const handlers = [
	new ProxyHandler(new RegExp(MY_PREFIX +"/mods(\\?.*)?$"),			REMOTE_SERVER + "/mods$1"			, new ModsRewriter()),
	new ProxyHandler(new RegExp(MY_PREFIX +"/mods/(.*)$"), 		REMOTE_SERVER + "/mods/$1"		, new SingleModRewriter()),
]

export default {
	async fetch(request, env, ctx): Promise<Response> {
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
