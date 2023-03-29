
class ChatArea {
    constructor(parent, G) {
        this.parent = parent;

        this.create();
    }

    create() {


        let container = this.parent.chatContainer;
        container.innerHTML = `<div class="chatlog">
                                <!-- chat messages will be appended here -->
                            </div>

                            <div id="chatMessageForm">
                                <input type="text" id="chatMessageInput" placeholder="Type your message...">
                                <button type="submit" id="chatMessageSendBtn">Send</button>
                            </div>`;
        this.messageInput = document.querySelector("#chatMessageInput");
        addListeners(this);

    }

    addMessage() {
        const messageInput = document.querySelector("#chatMessageInput");

        let message = messageInput.value.trim();
        if (message !== "") {
            let chatlog = document.querySelector(".chatlog");
            let newMessage = document.createElement("div");
            newMessage.classList.add("chatMessageItem");
            newMessage.textContent = message;
            chatlog.appendChild(newMessage);
            messageInput.value = "";
            // scroll to the bottom of the chatlog
            chatlog.scrollTop = chatlog.scrollHeight;
        }

    }


}

function addListeners(chatArea) {

    let sendBtn = document.getElementById("chatMessageSendBtn");
    sendBtn.addEventListener("click", chatArea.addMessage);
    chatArea.messageInput.addEventListener("keypress", function (event) {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
            // Cancel the default action, not sure if required?
            event.preventDefault();
            // Send message
            chatArea.addMessage();
        }
    });


}

export default ChatArea;
