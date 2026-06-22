import { useCallback, useEffect, useRef, useState } from "react";
import { generateComment } from "../../services/openrouter";
import { bridge } from "../../services/bridge";
import { parseContext } from "../../services/parseContext";
import type { Tone } from "../../types";
import { ToneSelector } from "./ToneSelector";
import { GenerateButton } from "./GenerateButton";
import { GeneratedComment } from "./GeneratedComment";

export function SidePanel() {
  const [ctx, setCtx] = useState<{ author: string; content: string } | null>(null);
  const [generated, setGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<Tone>("professional");
  const currId = useRef<string | null>(null);
  const elementAtGenerate = useRef<string | null>(null);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  useEffect(() => {
    bridge.init();
    const unsub = bridge.on("ELEMENT_FOCUSED", handleFocuseData);
    let cancelled = false;
    bridge.send("GET_INITIAL_CONTEXT").then((data) => {
      if (!cancelled && data) handleFocuseData(data);
    });
    function clearState() {
      setCtx(null);
      setGenerated("");
      currId.current = null;
    }
    const unsubFocusOut = bridge.on("FOCUS_OUT", clearState);
    const unsubClear = bridge.on("CLEAR_CONTEXT", clearState);
    return () => {
      cancelled = true;
      unsub();
      unsubFocusOut();
      unsubClear();
    };
  }, []);

  function handleFocuseData(data: any) {
    if (data._focused === false) {
      setCtx(null);
      setGenerated("");
      currId.current = null;
      return;
    }
    const id = data.elementId as string;
    if (id !== currId.current) setGenerated("");
    currId.current = id;
    const parsed = parseContext(data as Record<string, unknown>);
    if (parsed || ctxRef.current === null) setCtx(parsed);
  }

  const handleGenerate = useCallback(async () => {
    if (!ctx) return;
    setLoading(true);
    setGenerated("");
    elementAtGenerate.current = currId.current;
    const result = await generateComment(
      { author: ctx.author, content: ctx.content },
      tone,
    );
    if (currId.current !== elementAtGenerate.current) return;
    setGenerated(result);
    setLoading(false);
  }, [ctx, tone]);

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
      </div>

      {!ctx && (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          Click on a LinkedIn comment box to get started.
        </div>
      )}

      {ctx && (
        <>
          <div className="post-card">
            <div className="post-author">Post by: {ctx.author}</div>
            <div className="post-text">{ctx.content.slice(0, 300)}</div>
          </div>
          <ToneSelector value={tone} onChange={setTone} />
          <GenerateButton loading={loading} onClick={handleGenerate} />
          {generated && <GeneratedComment comment={generated} onInsert={handleInsert} />}
        </>
      )}
    </div>
  );
}
