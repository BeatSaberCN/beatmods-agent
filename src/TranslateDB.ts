import { ModInfo } from "./BeatModsRewriters/ModRewriters"

interface TranslateItem {
    id:number,

    translates:Record<string, string|null>,
    
    names: Record<string, string|null>,
    descriptions: Record<string, string|null>,
    summmaries: Record<string, string|null>,
}

abstract class TranslateDatabase{
    abstract findItem(mod:ModInfo):Promise<TranslateItem | undefined>
}

const inlineDatabase = (await import("./generated_inline_db.json")) as unknown as {
    default: {
        mods: Record<string /* mod id */, TranslateItem>
    }
}

class InlineTranslateDatabase extends TranslateDatabase{
    async findItem(mod: ModInfo): Promise<TranslateItem | undefined> {
        return inlineDatabase.default.mods[""+mod.id]
    }
}

export const TranslateDBItem = new InlineTranslateDatabase()