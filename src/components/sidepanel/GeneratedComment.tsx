interface Props {
    comment: string;
    onInsert: () => void;
}

export function GeneratedComment({ comment, onInsert }: Props) {
    return (
        <div className="comment-card">
            <div className="comment-card-header">Generated Comment</div>
            <div className="comment-card-body">{comment}</div>
            <div className="comment-card-actions">
                <button className="btn btn-primary" onClick={onInsert}>
                    Insert Comment
                </button>
            </div>
        </div>
    );
}
