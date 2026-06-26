interface Message {
    sender: string;
    text: string;
}


interface Props {
    recipient: string;
    conversation: Message[];
}

export function DMConversation({ recipient, conversation }: Props) {
    return (
        <div className="dm-conversation">
            {
                conversation.map((msg, index) => (
                    <div key={index}
                        className={`dm-bubble ${msg.sender === recipient ? 'dm-bubble-received' : 'dm-bubble-sent'}`}
                    >
                        <div className="dm-bubble-sender">{msg.sender}</div>
                        <div className="dm-bubble-text">{msg.text}</div>
                    </div>
                ))
            }
        </div>
    );
}