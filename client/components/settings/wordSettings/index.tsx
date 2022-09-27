import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { getMorphs, setMorphs, MorphState } from "@/lib/morphs"

import { Textarea } from "@mantine/core"

function WordSettings() {
    const { data: morphs, isLoading } = useQuery("morphs", ()=>getMorphs(MorphState.KNOWN));
    const [wordText, setWordText] = useState('');

    useEffect(()=>{
        if (morphs) {
            setWordText(morphs.join('\n'));
        }
    }, [morphs])

    const updateMorphs = (text: string) => {
        setWordText(text);
        const newMorphs = text.split(/[\r\n]+/);
        setMorphs(MorphState.KNOWN, newMorphs);
    }

    if (isLoading) {
        return <></>
    }

    return (
        <>
         <Textarea
            minRows={20}
            value={wordText}
            onChange={(e) => updateMorphs(e.target.value)}
            />
        </>
    )
}

export default WordSettings