import type { useCollectionsStore,useRelationsStore,useFieldsStore } from '../../utils/stores'

declare module '@directus/extensions-sdk' {
    export function useStores(): {
        useCollectionsStore: typeof useCollectionsStore;
        useRelationsStore: typeof useRelationsStore;
        useFieldsStore: typeof useFieldsStore;
    }
}
