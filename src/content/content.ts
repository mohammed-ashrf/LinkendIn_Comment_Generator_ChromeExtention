const commentBoxes = new Map<string, HTMLElement>();

function findPostContainer(commentElement: HTMLElement): HTMLElement | null {
    return commentElement.closest('[role="listitem"]');
}

function extractPostText(postContainer: HTMLElement): string | null {
    if (!postContainer) {
        return null;
    }
    
    const postText = postContainer.innerText.trim();

    return postText?.split(/\n?Most relevant\n?/)[0]?.replace(/Follow/, "").replace(/\n?… more\n?/g, "") ?? null;
}

function extractAuthor(postContainer: HTMLElement): string | null {
    if (!postContainer) {
        return null;
    }
    const aria = postContainer.querySelector('[aria-label*=" Profile "]')?.getAttribute('aria-label');

    return aria?.split(" Profile ")[0].replace(/ (Verified|Premium)$/, "") ?? null;
}

function generateUniqueId(): string {
    return crypto.randomUUID();
}

function insertComment(commentBoxId: string, comment: string) {
    const input = commentBoxes.get(commentBoxId);
    if (!input) {
        console.warn(`No comment box found for ID: ${commentBoxId}`);
        return;
    }

    input.focus();
    input.textContent = "";
    document.execCommand("insertText", false, comment);
}

if (window.location.hostname.includes("linkedin.com")) {
    console.log("LinkedIn detected");

    document.addEventListener("focusin", (event) => {
        const target = event.target as HTMLElement;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        const isEditable = target.getAttribute("contenteditable") === "true" && target.getAttribute("role") === "textbox";

        if (!isEditable) {
            return;
        }

        let commentBoxId = target.dataset.commentBoxId;

        if (!commentBoxId) {
            commentBoxId = generateUniqueId();
            target.dataset.commentBoxId = commentBoxId;
            commentBoxes.set(commentBoxId, target);
        }
        
        const postContainer = findPostContainer(target);

        if (postContainer) {
            console.log("Post container found:", postContainer);
            const postText = extractPostText(postContainer);
            const authorName = extractAuthor(postContainer);

            const postData = {
                commentBoxId,
                authorName,
                postText
            };

            try {
                chrome.runtime.sendMessage({
                    type: "POST_SELECTED",
                    payload: postData
                });
            } catch {
                console.error("Failed to send POST_SELECTED message");
            }
        } else {
            console.log("No post container found for the active input element.");
        }
    });

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message.type === "INSERT_COMMENT") {
            insertComment(message.commentBoxId, message.comment);
            sendResponse({ success: true });
            return true;
        }
    });
}