import { JsonRewriter } from "../Rewriter";
import { TranslateDBItem } from "../TranslateDB";

// https://beatmods.com/api/mods
export interface Mods {
    mods:[{
        mod: ModInfo,
        latest: ModVersion
    }]
}

// https://beatmods.com/api/mods/2
export interface SingleMod {
    mod:{
        info: ModInfo
    },
    versions: [ModVersion]
}

export interface ModInfo{
    id:number,
    name:string|null|undefined,
    summary:string|null|undefined,
    description:string|null|undefined,
    authors: ModAuthor[]
}

export interface ModAuthor{
    id:number,
    username: string,
    displayName:string
}

export interface ModVersion {
    id:number,
    modId: number
}

async function rewriteModInfo(modInfo:ModInfo):Promise<ModInfo>{
    const dbItem = await TranslateDBItem.findItem(modInfo)
    if(dbItem == undefined)
        return modInfo
    const trans = (eng_text:string|null|undefined, prefer:Record<string,string|null>)=>{
        if(typeof(eng_text) != "string")
            return eng_text
        
        const prefer_text = prefer[eng_text]
        if(typeof(prefer_text) == "string" && prefer_text != "")
            return prefer_text

        const fallback_text = dbItem.translates[eng_text]
        if(typeof(fallback_text) == "string" && fallback_text != "")
            return fallback_text

        return eng_text
    }

    let name_trans = trans(modInfo.name, dbItem.names)
    if(name_trans != modInfo.name)
        name_trans = modInfo.name + " / " + name_trans
    
    modInfo.name = name_trans
    modInfo.description = trans(modInfo.description, dbItem.descriptions)
    modInfo.summary = trans(modInfo.summary, dbItem.summmaries)
    
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