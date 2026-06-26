interface Props {
    comment: string;
    onInsert: () => void;
    header?: string;
    buttonLabel?: string;
}

export function GeneratedComment({ comment, onInsert, header= "Generated Comment", buttonLabel = "Insert Comment" }: Props) {
    return (
        <div className="comment-card">
            <div className="comment-card-header">{header}</div>
            <div className="comment-card-body">{comment}</div>
            <div className="comment-card-actions">
                <button className="btn btn-primary" onClick={onInsert}>
                    {buttonLabel}
                </button>
            </div>
        </div>
    );
}
