import styled from '@emotion/styled';

const HighlightedText = styled.span`
  /* color: #228be6; */
  color: #009C95;
  background: none; 
  margin: 0
`;


const filterEmpty = (list) => list.filter(word=>word.replace(/\s/g,'').length > 0)

const parseEntryList = (list) => {
  if (!list) {
    return []
  }
  const filteredList = filterEmpty(list)
  return filteredList.filter((item, index)=>{
    const redundant = index+1 < filteredList.length && item === '.' && filteredList[index+1] === '.';
    return !redundant
  })
}

export const parseSentence = ({exampleId, wordList, wordIndexes, sentenceWithFurigana, exactMatch}) => {
    if (!wordList) {
      return ''
    }

    if (!wordIndexes) {
      return parseExactSentenceWithFurigana({
        exampleId, 
        sentence: wordList.join(''),
        sentenceWithFurigana,
        keyword: ''
      })
    }

    if (exactMatch?.length > 0) {
      return parseExactSentenceWithFurigana({
        exampleId,
        sentence: wordList.join(''),
        sentenceWithFurigana,
        keyword: exactMatch
      })
    }

    const furiganaList = getFuriganaList(sentenceWithFurigana)
    const trimmedSentence = wordList.join('').replace(/\s/g,'')
    let sentenceIndexPointer = 0;
    const keywordIndexes = [];
    wordList.forEach((word, index)=>{
      if (wordIndexes.includes(index)) {
        for (let i = 0; i < word.length; i++) {
          keywordIndexes.push(sentenceIndexPointer+i)
        } 
      }
      sentenceIndexPointer += word.replace(/\s/g,'').length;
    })
    return (
      furiganaList
      .filter(item=>item.kanji?.length > 0 || item.furigana?.length > 0)
      .map((item, index)=>(
        item.kanji.length > 0 ? 
        <ruby key={`example_${exampleId}_item${index}`}>
          {[].map.call(item.kanji, (kanjiCharacter, characterIndex)=>{
            const kanjiRootIndex = trimmedSentence.length - item.reversedIndex - (item.kanji.length - characterIndex);
            return keywordIndexes.includes(kanjiRootIndex) ?
            <HighlightedText key={`example_${exampleId}_sentence_${index}_kanji_${characterIndex}`}>
              {kanjiCharacter}
            </HighlightedText>
            :
            kanjiCharacter
            })}
          <rt style={{WebkitUserSelect: 'none'}}>{item.furigana}</rt>
        </ruby>
        :
        [].map.call(item.furigana, (furiganaCharacter, characterIndex)=>{
          const furiganaRootIndex = trimmedSentence.length - item.reversedIndex - (item.furigana.length - characterIndex);
          return keywordIndexes.includes(furiganaRootIndex) ?
          <HighlightedText key={`example_${exampleId}_sentence_${index}_furigana_${characterIndex}`}>
            {furiganaCharacter}
          </HighlightedText>
          :
          <span key={`example_${exampleId}_sentence_${index}_furigana_${characterIndex}`}>
          {furiganaCharacter}
          </span>
          })
      ))
      )
  }

  export const hasFuriganaReading = (sentence) => sentence.indexOf('[') >= 0 && sentence.indexOf(']') >= 0;

  export const parseExactSentenceWithFurigana = ({exampleId, sentence, sentenceWithFurigana, keyword}) => {
    const removeAnchors = string => string.replace(new RegExp("<.*?>", "g"), "");
    sentence = removeAnchors(sentence);
    sentenceWithFurigana = removeAnchors(sentenceWithFurigana);
    const furiganaList = getFuriganaList(sentenceWithFurigana)
    const sentenceHasFurigana = furiganaList.length > 0 && sentence.length === sentenceWithFurigana.length;
    if (sentenceHasFurigana) {
      sentence = furiganaList.map(item => item.kanji ? item.kanji : item.furigana).join('');
    }
    const trimmedSentence = sentence.replace(/\s/g,'')
    const keyword_heads= [...trimmedSentence.matchAll(new RegExp(keyword, 'gi'))].map(s => s.index)
    const keyword_bodies = []
    keyword_heads.forEach(index=>{
      for (let i = 0; i < keyword.length; i++) {
        keyword_bodies.push(index+i)
      }
    })
    return (
      furiganaList.map((item, index)=>(
        item.kanji.length > 0 ? 
        <ruby key={`example_${exampleId}_item${index}`}>
          {[].map.call(item.kanji, (kanjiCharacter, characterIndex)=>{
            const kanjiRootIndex = trimmedSentence.length - item.reversedIndex - (item.kanji.length - characterIndex);
            return keyword_bodies.includes(kanjiRootIndex) ?
            <HighlightedText key={`example_${exampleId}_sentence_${index}_kanji_${characterIndex}`}>
              {kanjiCharacter}
            </HighlightedText>
            :
            kanjiCharacter
            })}
          <rt style={{WebkitUserSelect: 'none'}}>{item.furigana}</rt>
        </ruby>
        :
        [].map.call(item.furigana, (furiganaCharacter, characterIndex)=>{
          const furiganaRootIndex = trimmedSentence.length - item.reversedIndex - (item.furigana.length - characterIndex);
          return keyword_bodies.includes(furiganaRootIndex) ?
          <HighlightedText key={`example_${exampleId}_sentence_${index}_furigana_${characterIndex}`}>
            {furiganaCharacter}
          </HighlightedText>
          :
          <span key={`example_${exampleId}_sentence_${index}_furigana_${characterIndex}`}>
          {furiganaCharacter}
          </span>
          })
      ))
    )
  }

  const getFuriganaList = (sentence) => {
    if (sentence === undefined) {
      return ''
    }
    let compiledList = []
    let text = '';
    let parsing_furigana = false;
    let finding_kanji = false;
    let furigana = '';
    let kanji = '';
    let indexCount = 0;
    for (let i = sentence.length-1; i >= 0; i--) {
      if (sentence[i] === ']') {
        parsing_furigana = true;
        if (text.length > 0) {
          // text with no reading 
          compiledList.unshift({
            furigana: text,
            kanji: '',
            reversedIndex: indexCount                                                                                                                              
          })
          indexCount += text.replace(/\s/g,'').length;
          text = '';
        }
      } else if (sentence[i] === '[') {
        parsing_furigana = false;
        finding_kanji = true;
      } else if (parsing_furigana) {
        furigana = sentence[i] + furigana;
      } else if (finding_kanji) {
        if (i === 0 || sentence[i] === ' ') {
          kanji = sentence[i] + kanji;
          // kanji with reading
          compiledList.unshift({
            furigana: furigana,
            kanji: kanji,
            reversedIndex: indexCount,
          })
          indexCount += kanji.trim().length;
          furigana = '';
          kanji = '';
          finding_kanji = false;
        } else {
          kanji = sentence[i] + kanji;
        }
      } else {
        text = sentence[i] + text;
      }
    }
    // text with no reading?
    compiledList.unshift({
      furigana: text,
      kanji: '',
      reversedIndex: indexCount,
    })
    const filteredList =  compiledList
    .filter(item=>item.furigana.length > 0 || item.kanji.length > 0)
    .map(item=>{
      return {
        kanji: item.kanji.replace(/\s/g,''),
        furigana: item.furigana.replace(/\s/g,''),
        reversedIndex: item.reversedIndex
      }
    });
    let rawSentence = '';
    filteredList.forEach(item=>rawSentence += item.kanji ? item.kanji: item.furigana)
    const result = filteredList.map(item=>{
      const itemLength = item.kanji ? item.kanji.length : item.furigana.length;
      return {
        'index': rawSentence.length - item.reversedIndex - itemLength,
        ...item
      }
    })
    return result
  }

  export const parseTranslation = ({exampleId, translation, wordList, wordIndexes}) => {
    if (!wordList) {
      return ''
    }

    const wordsToHighlight = wordIndexes ? wordList.filter((word, index)=>wordIndexes.includes(index)).map(word=>word.toLowerCase()) : [];
    const removePunctuation = string => string.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
    return (
      <>
        {translation.split(' ').map((word, index)=> (
          wordsToHighlight.includes(removePunctuation(word.toLowerCase())) ?
          <HighlightedText key={`example_${exampleId}_highlighted_${index}`}>{word} </HighlightedText>
          :
          word + ' '
        ))}
      </>
    )
}
