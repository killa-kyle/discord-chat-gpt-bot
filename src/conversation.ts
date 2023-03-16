import {getCompletion, getEmbedding, getAiImage} from './openAI'
import {readDb, writeDb, getCurrentDateTime, createDb, clearJsonFile} from './db'
import crypto from 'crypto'
import {encode as gptEncode} from 'gpt-3-encoder'
const DB_FOLDER = './conversations'

import {Conversation} from './types'

/**
 *  getBotCompletionResponse gets a response from the assistant updating the conversation in the db as it goes
 *
 * @param message     discord message object
 * @param userId      String discord userId of the message author
 * @returns response  String response from the assistant
 */
export const getBotCompletionResponse = async (message, userId) => {
    // create a new conversation for the user if one doesn't exist
    const USER_DB_PATH = `${DB_FOLDER}/${userId}`
    await createDb(USER_DB_PATH)
    // read the conversation from the db
    const conversation = readDb(USER_DB_PATH)

    // get the parent message id if one exists from the conversation
    const parentMessageId = conversation[conversation?.length - 1]?.id || crypto.randomUUID()

    // add the user's message to the conversation
    const userMessage = {
        id: crypto.randomUUID(),
        parentMessageId,
        user: userId,
        role: 'user',
        content: message.content,
        embedding: [],
        timestamp: getCurrentDateTime(),
    }
    conversation.push(userMessage)

    // write the conversation to the db
    await writeDb(conversation, USER_DB_PATH)

    // get the latest 8 interactions between the user and the assistant
    // we can also pass a tokens option to get the latest interactions that are less than or equal to the number of tokens
    const context = await getConversationContext(conversation, {tokens: 2500})

    // format the context for the openAI api
    const contextAwarePrompt: Partial<Conversation>[] = context.map(message => {
        return {
            role: message?.role,
            content: message?.content,
        }
    })

    // get the bot's response
    const response = await getCompletion(contextAwarePrompt)
    // add the bot's response to the conversation
    const botMessage = {
        id: crypto.randomUUID(),
        parentMessageId: userMessage.id,
        user: userId,
        role: 'assistant',
        content: response,
        embedding: [],
        timestamp: getCurrentDateTime(),
    }
    conversation.push(botMessage)

    // write the conversation to the db
    await writeDb(conversation, USER_DB_PATH)

    return response
}

export const clearConversation = async userId => {
    if (!userId) return
    const USER_DB_PATH = `${DB_FOLDER}/${userId}.json`
    await clearJsonFile(USER_DB_PATH)
}

/**
 * get the latest n interactions between the user and the assistant
 * @param conversation
 * @param interactions
 * @returns Conversation[]
 * @throws an error if the conversation is not provided
 **/
const getLatestInteractions = (conversation, interactions = 10) => {
    if (!conversation) {
        throw new Error('conversation is required')
    }
    // loop through the conversation and get the latest n interactions between the user and the assistant
    const conversationContext = [...conversation]
    const context = [] as any
    while (conversationContext.length > 0 && context.length < interactions) {
        const message = conversationContext.pop()
        if (message?.role === 'user' || message?.role === 'assistant') {
            context.push(message)
        }
    }
    return context.reverse()
}

/**
 * get the latest n interactions between the user and the assistant that are less than or equal to the number of tokens
 * @param conversation
 * @param tokens
 * @returns Conversation[]
 */
const getLatestInteractionsByTokens = async (conversation, tokens = 3097) => {
    if (!conversation) {
        throw new Error('conversation is required')
    }
    const conversationContext = [...conversation]
    const context = [] as any
    let tokenCount = 0
    while (conversationContext.length > 0 && tokenCount <= tokens) {
        const message = conversationContext.pop()
        if (message?.role === 'user' || message?.role === 'assistant') {
            let messageTokenCount = (await getTokenCount(message.content)) || 0
            context.push(message)
            tokenCount += messageTokenCount
        }
    }
    return context.reverse()
}

// get the latest n interactions between the user and the assistant
export const getConversationContext = (
    conversation: Conversation[],
    options: {interactions?: number; tokens?: number}
) => {
    if (!conversation) {
        throw new Error('conversation is required')
    }
    const {interactions, tokens} = options
    // if tokens are provided, get the latest n interactions between the user and the assistant that are less than or equal to the number of tokens, otherwise get the latest n interactions between the user and the assistant
    if (tokens) {
        return getLatestInteractionsByTokens(conversation, tokens)
    } else {
        return getLatestInteractions(conversation, interactions)
    }
}

const getTokenCount = text => {
    let currentInput = text
    try {
        return gptEncode(text).length
    } catch (error) {
        console.log('getTokenCount error:', error, {currentInput})
        return null
    }
}
