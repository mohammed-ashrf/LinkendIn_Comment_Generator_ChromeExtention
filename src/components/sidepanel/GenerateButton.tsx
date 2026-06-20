interface Props {
    loading: boolean;
    onClick: () => void;
}

export function GenerateButton({ loading, onClick }: Props) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="btn btn-primary"
        >
            {loading && <span className="spinner" />}
            {loading ? "Generating..." : "Generate Comment"}
        </button>
    );
}
