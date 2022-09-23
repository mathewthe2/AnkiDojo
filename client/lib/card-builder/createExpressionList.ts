export default function createExpressionList(words:string[]) {
    return words.map(word=>{
      return {
        userExpression: word
      }
    })
  }
