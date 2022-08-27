import { useRouter } from 'next/router'
import { useEffect, useState} from 'react';
import { drillCatalog } from '../../lib/drill/drillCatalog';
import { DrillCatalogInterface } from '@/interfaces/drill/DrillCatalogInterface';

export function useDrillData(drillId: string) {
    const [drill, setDrill] = useState<DrillCatalogInterface>();
    const [hasError, setHasError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {query, asPath } = useRouter();

    // TODO: call API instead
    useEffect(()=>{
        // const title = query.title as string;
        let hasData = false;
        drillCatalog.forEach(drillItem=>{
            if (drillId === drillItem.id) {
            setDrill(drillItem);
                hasData = true;
            }
        })

        if (!hasData) {
            setHasError(true);
        } else {
            setHasError(false);
        }
        setIsLoading(false);
    }, [asPath])
    return {
        drill: drill,
        isLoading: isLoading,
        hasError: hasError
    }
}