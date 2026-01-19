# BeatMods Agent

TLDR;

This is a cloudflare worker that do some agent function for BeatMods. Mainly for the Chinese localization work.

It handles incoming requests and forward to beatmods's api server, the response will be rewritten by the project to add more informations or do the translate.

# BeatMods代理服务

这是一个CloudFlare Worker服务。可以委托访问BeatMods的服务器，并增加翻译内容。

# 测试/部署

测试`npm run dev`，部署`npm run deploy`。

上面指令会自动执行`python inline_database/upgrade.py`。

# InlineDatabase

这是一个嵌入在源码中的翻译数据。需要通过`python inline_database/upgrade.py`将零散的json打包成一个`src\generated_inline_db.json`文件。