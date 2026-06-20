import type { Tone } from "../../types";

interface Props {
    value: Tone;
    onChange: (value: Tone) => void;
}

export function ToneSelector({ value, onChange }: Props) {
    return (
        <div>
            <span className="label">Comment Tone</span>
            <div className="select-wrapper">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value as Tone)}
                >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="insightful">Insightful</option>
                    <option value="agree">Agree</option>
                    <option value="challenge">Challenge</option>
                    <option value="question">Question</option>
                    <option value="humorous">Humorous</option>
                </select>
            </div>
        </div>
    );
}
