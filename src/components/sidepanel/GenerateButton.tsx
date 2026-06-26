interface Props {
    loading: boolean;
    onClick: () => void;
    label?: string;
}

export function GenerateButton({ loading, onClick, label = "Generate Comment" }: Props) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="btn btn-primary"
        >
            {loading && <span className="spinner" />}
            {loading ? "Generating..." : label}
        </button>
    );
}
