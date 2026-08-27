import { CARD_COLORS } from "../lib/colors";

const COLOR_NAMES = [
  "Índigo",
  "Cielo",
  "Esmeralda",
  "Ámbar",
  "Rojo",
  "Rosa",
  "Violeta",
  "Verde agua",
];

export function ColorSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="swatches" role="group" aria-label="Color de la tarjeta">
      {CARD_COLORS.map((color, i) => (
        <button
          key={color}
          type="button"
          className="swatch"
          style={{ background: color }}
          aria-pressed={value === color}
          aria-label={COLOR_NAMES[i] ?? `Color ${i + 1}`}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}
