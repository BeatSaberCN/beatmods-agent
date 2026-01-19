# BeatMods Agent

TLDR;

This is a cloudflare worker that do some agent function for BeatMods. Mainly for the Chinese localization work.

It handles incoming requests and forward to beatmods's api server, the response will be rewritten by the project to add more informations or do the translate.

# BeatMods代理服务

这是一个CloudFlare Worker服务。可以委托访问BeatMods的服务器，并增加翻译内容。