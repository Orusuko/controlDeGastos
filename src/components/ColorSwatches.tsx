import { CARD_COLORS } from "../lib/colors";

export function ColorSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="swatches" role="group" aria-label="Color de la tarjeta">
      {CARD_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className="swatch"
          style={{ background: color }}
          aria-pressed={value === color}
          aria-label={`Color ${color}`}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
