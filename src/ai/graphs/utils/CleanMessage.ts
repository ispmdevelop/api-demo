import {
  AIMessage,
  HumanMessage,
  MessageContent,
} from '@langchain/core/messages';

export function cleanMessageHistory(
  messages: (HumanMessage | AIMessage)[]
): (HumanMessage | AIMessage)[] {
  const cleanedMessages: (HumanMessage | AIMessage)[] = [];

  if (messages.length <= 1) {
    return messages;
  }

  let currentType = null;
  let currentContent: string = '';

  for (let i = 0; i < messages.length; i++) {
    const currentType = messages[i].getType();
    currentContent = (currentContent + messages[i].content + '\n') as string;
    if (messages[i + 1] && currentType === messages[i + 1].getType()) {
      continue;
    } else {
      cleanedMessages.push(
        currentType === 'human'
          ? new HumanMessage(currentContent)
          : new AIMessage(currentContent)
      );
      currentContent = '';
    }
  }

  return cleanedMessages;
}
