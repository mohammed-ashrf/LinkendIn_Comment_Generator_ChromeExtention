import { useCallback, useEffect, useRef, useState } from "react";
import { generateComment, generateMessage } from "../../services/openrouter";
import { bridge } from "../../services/bridge";
import { parseContext, parseDMContext } from "../../services/parseContext";
import type { ReplyTo, Tone, DMContext } from "../../types";
import { ToneSelector } from "./ToneSelector";
import { GenerateButton } from "./GenerateButton";
import { GeneratedComment } from "./GeneratedComment";
import { DMHeader } from "./DMHeader";
import { DMConversation } from "./DMConversation";

export function SidePanel() {
  const [ctx, setCtx] = useState<{ author: string; content: string; replyTo: ReplyTo | null } | null>(null);
  const [dmCtx, setDmCtx] = useState<DMContext | null>(null);
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<Tone>("professional");
  const currId = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const elementAtGenerate = useRef<string | null>(null);
  const generatedMap = useRef<Map<string, string>>(new Map());
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    bridge.init();
    const unsub = bridge.on("ELEMENT_FOCUSED", handleFocuseData);
    let cancelled = false;
    bridge.send("GET_INITIAL_CONTEXT").then((data) => {
      if (!cancelled && data) handleFocuseData(data);
    });
    function clearState() {
      if (loadingRef.current) return;
      console.log("[SidePanel] clearState");
      setCtx(null);
      setDmCtx(null);
      setGenerated("");
      currId.current = null;
    }
    const unsubFocusOut = bridge.on("FOCUS_OUT", clearState);
    const unsubClear = bridge.on("CLEAR_CONTEXT", clearState);
    const unsubUrlChange = bridge.on("URL_CHANGED", (data) => {
      console.log("[SidePanel] URL_CHANGED ->", data.pageUrl);
      lastUrlRef.current = data.pageUrl as string;
      clearState();
    });
    return () => {
      cancelled = true;
      unsub();
      unsubFocusOut();
      unsubClear();
      unsubUrlChange();
    };
  }, []);

  function handleFocuseData(data: any) {
    if (data._focused === false) {
      if (loadingRef.current) return;
      setCtx(null);
      setDmCtx(null);
      setGenerated("");
      currId.current = null;
      return;
    }
    const eventUrl = data.pageUrl as string | undefined;
    if (lastUrlRef.current && eventUrl && eventUrl !== lastUrlRef.current) return;
    console.log("[handleFocuseData] has dmHtml:", !!data.dmHtml, "dmHtml len:", data.dmHtml?.length);
    const id = data.elementId as string;
    const saved = generatedMap.current.get(id);
    if (id !== currId.current && !saved) setGenerated("");
    currId.current = id;
    if (saved) setGenerated(saved);
    const dmParsed = parseDMContext(data as Record<string, unknown>);
    if (dmParsed) {
        setDmCtx(dmParsed);
        setCtx(null);
    } else if (data.pageUrl) {
        const parsed = parseContext(data as Record<string, unknown>);
        if (parsed || ctxRef.current === null) setCtx(parsed);
        if (parsed) setDmCtx(null);
    }
    console.log("[handleFocuseData] pageUrl:", data.pageUrl, "isDM:", !!dmParsed);
  }

  const handleGenerate = useCallback(async () => {
    if (!ctx) return;
    loadingRef.current = true;
    setLoading(true);
    setGenerated("");
    elementAtGenerate.current = currId.current;
    try {
      const result = await generateComment(
        { author: ctx.author, content: ctx.content, replyTo: ctx.replyTo },
        tone,
      );
      if (currId.current !== elementAtGenerate.current) return;
      setGenerated(result);
      if (currId.current) {
        generatedMap.current.set(currId.current, result);
        if (generatedMap.current.size > 20) {
          const key = generatedMap.current.keys().next().value;
          if (key) generatedMap.current.delete(key);
        }
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [ctx, tone]);

  const handleGenerateDM = useCallback(async () => {
    if (!dmCtx) return;
    loadingRef.current = true;
    setLoading(true);
    setGenerated("");
    elementAtGenerate.current = currId.current;
    try {
      const result = await generateMessage(dmCtx, tone);
      if (currId.current !== elementAtGenerate.current) return;
      setGenerated(result);
      if (currId.current) {
        generatedMap.current.set(currId.current, result);
        if (generatedMap.current.size > 20) {
          const key = generatedMap.current.keys().next().value;
          if (key) generatedMap.current.delete(key);
        }
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [dmCtx, tone]);

  const handleInsert = useCallback(() => {
    if (!currId.current || !generated) return;
    const targetId = currId.current;
    bridge.send("INSERT_TEXT", {
      elementId: targetId,
      text: generated,
    });
  }, [generated]);

  return (
    <div className="sidepanel">
      <div className="sidepanel-header">
        <div className="brand-dot" />
        <h1>evyAI Assistant</h1>
        {(ctx || dmCtx) && (
          <span className="surface-badge">{ctx ? 'Comment' : dmCtx ? 'Direct Message' : ''}</span>
        )}
      </div>

      {!ctx && !dmCtx && (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          Click on a LinkedIn comment or DM box to get started.
        </div>
      )}

      {ctx && (
        <>
          <div className="post-card">
            {ctx.replyTo && (
              <div className="reply-badge">↪ Replying to {ctx.replyTo.name}</div>
            )}
            <div className="post-author">Post by: {ctx.author}</div>
            <div className="post-text">{ctx.content.slice(0, 300)}</div>
            {ctx.replyTo && (
              <div className="reply-comment">
                <div className="reply-comment-header">Parent comment by {ctx.replyTo.name}:</div>
                <div className="reply-comment-text">{ctx.replyTo.comment.slice(0, 200)}</div>
              </div>
            )}
          </div>
          <ToneSelector value={tone} onChange={setTone} />
          <GenerateButton loading={loading} onClick={handleGenerate} />
          {generated && <GeneratedComment comment={generated} onInsert={handleInsert} />}
        </>
      )}

      {dmCtx && (
        <>
          <DMHeader recipient={dmCtx.recipient} />
          <DMConversation recipient={dmCtx.recipient} conversation={dmCtx.conversation} />
          <ToneSelector value={tone} onChange={setTone} />
          <GenerateButton loading={loading} onClick={handleGenerateDM} label="Generate Message" />
          {generated && <GeneratedComment comment={generated} onInsert={handleInsert} header="Generated Message" buttonLabel="Send Message" />}
        </>
      )}
    </div>
  );
}
