console.log("Content script initialized");

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

if (window.location.hostname.includes("linkedin.com")) {
    console.log("LinkedIn detected");
    let activeInputElement: HTMLElement | null = null;

    document.addEventListener("focusin", (event) => {
        const target = event.target as HTMLElement;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        const isEditable = target.getAttribute("contenteditable") === "true" && target.getAttribute("role") === "textbox";

        if (!isEditable) {
            return;
        }

        activeInputElement = target;

        const postContainer = findPostContainer(activeInputElement);

        if (postContainer) {
            console.log("Post container found:", postContainer);
            const postText = extractPostText(postContainer);
            const authorName = extractAuthor(postContainer);
            if (postText) {
                console.log("Extracted post text:", postText);
            }
            if (authorName) {
                console.log("Extracted author name:", authorName);
            }
        } else {
            console.log("No post container found for the active input element.");
        }
    });
}