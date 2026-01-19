import { JsonRewriter } from "../Rewriter";

// https://beatmods.com/api/mods
interface Mods {
    mods:[{
        mod: ModInfo,
        latest: ModVersion
    }]
}

// https://beatmods.com/api/mods/2
interface SingleMod {
    mod:{
        info: ModInfo
    },
    versions: [ModVersion]
}

interface ModInfo{
    id:number,
    name:string,
    summary:string,
    description:string,
    authors: [ModAuthor]
}

interface ModAuthor{
    id:number,
    username: string,
    displayName:string
}

interface ModVersion {
    id:number,
    modId: number
}

async function rewriteModInfo(modInfo:ModInfo):Promise<ModInfo>{
    return modInfo
}

//////////////////////////

export class ModsRewriter extends JsonRewriter {
    async rewriteJson(input: Mods): Promise<Mods> {
        for(const mod of input.mods){
            mod.mod = await rewriteModInfo(mod.mod)
        }
        return input
    }
}

export class SingleModRewriter extends JsonRewriter {
    async rewriteJson(input: SingleMod): Promise<SingleMod> {
        input.mod.info = await rewriteModInfo(input.mod.info)
        return input
    }
}