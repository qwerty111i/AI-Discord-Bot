export async function fetchMessages(channel, numMessages) {
    let allMessages = [];
    let lastMessage = null;
    let fetchedMessages = [];

    do {
        // Fetching messages (API limits calls to 100 at a time)
        fetchedMessages = await channel.messages.fetch({
            limit: 100,
            before: lastMessage ? lastMessage.id : undefined, // Specifying to get messages before last fetched
        });

        // Adding fetched messages to allMessages
        allMessages = allMessages.concat([...fetchedMessages.values()]);

        // Updating the last message so new fetches start before it
        if (fetchedMessages.size > 0) {
            lastMessage = fetchedMessages.last();
        }
    } while (allMessages.length < numMessages && fetchedMessages.size > 0);

    // Returning the requested number of messages (if more was fetched)
    return allMessages.slice(0, numMessages);
}