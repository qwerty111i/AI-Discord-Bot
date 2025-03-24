export function splitMessage(message) {
    // Regex expression
    const sentences = message.split(/(?<=[.!?:])\s+/);
    
    let chunk = '';
    let messageChunks = [];
  
    for (const sentence of sentences) {
      if (chunk.length + sentence.length + 1 <= 2000) {
        chunk += sentence + ' ';
      } else {
        messageChunks.push(chunk.trim());
        chunk = sentence + ' ';
      }
    }
  
    // Pushing the last remaining chunk
    if (chunk.length > 0) {
      messageChunks.push(chunk.trim());
    }
  
    // Returning an array of chunks
    return messageChunks;
}