interface Props {
    recipient: string;
}

export function DMHeader({ recipient }: Props) {
    return (
        <div className="dm-header">
            <div className="dm-header-label">Message to</div>
            <div className="dm-recipient">{recipient}</div>
        </div>
    );
}