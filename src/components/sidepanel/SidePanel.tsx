import { useEffect, useRef, useState } from "react";
import { generateComment } from "../../services/openrouter";
import type { Tone } from "../../types";
import { ToneSelector } from "./ToneSelector";
import { GenerateButton } from "./GenerateButton";
import { GeneratedComment } from "./GeneratedComment";

interface SidePanelPost {
    commentBoxId: string;
    authorName: string | null;
    postText: string | null;
}

export function SidePanel() {
    const [selectedPost, setSelectedPost] = useState<SidePanelPost | null>(null);
    const [comment, setComment] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [tone, setTone] = useState<Tone>("professional");
    const prevBoxIdRef = useRef<string | null>(null);

    useEffect(() => {
        const listener = (message: { type: string; payload: SidePanelPost }) => {
            if (message.type === "POST_SELECTED") {
                setSelectedPost(message.payload);
                if (message.payload.commentBoxId !== prevBoxIdRef.current) {
                    setComment("");
                }
                prevBoxIdRef.current = message.payload.commentBoxId;
            }
            return undefined;
        };

        chrome.runtime.onMessage.addListener(listener);

        return () => {
            chrome.runtime.onMessage.removeListener(listener);
        };
    }, []);

    async function handleGenerate() {
        if (!selectedPost) return;
        setLoading(true);
        setComment("");
        const result = await generateComment(
            { author: selectedPost.authorName ?? "Unknown", content: selectedPost.postText ?? "" },
            tone
        );
        setComment(result);
        setLoading(false);
    }

    function handleInsert() {
        if (!selectedPost) return;
        chrome.runtime.sendMessage({
            type: "INSERT_COMMENT",
            commentBoxId: selectedPost.commentBoxId,
            comment
        }).catch(() => {});
    }

    return (
        <div className="sidepanel">
            <div className="sidepanel-header">
                <div className="brand-dot" />
                <h1>evyAI Assistant</h1>
            </div>
            {selectedPost ? (
                <>
                    <div className="post-card">
                        <div className="post-author">Post by: {selectedPost.authorName ?? "Unknown"}</div>
                        <div className="post-text">{selectedPost.postText?.slice(0, 200)}</div>
                    </div>
                    <ToneSelector value={tone} onChange={setTone} />
                    <GenerateButton loading={loading} onClick={handleGenerate} />
                    {comment && <GeneratedComment comment={comment} onInsert={handleInsert} />}
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    Click on a LinkedIn comment box to get started.
                </div>
            )}
        </div>
    )
}
