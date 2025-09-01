"use client";

import type { Rating } from "@/lib/types";

type Props = {
  value: Rating;
  disabled?: boolean;
  onChange: (r: Rating) => void;
};

const btnStyle =
  "rounded-xl border px-4 py-2 text-lg transition active:scale-95 disabled:opacity-50";

export function RatingButtons({ value, disabled, onChange }: Props) {
  const is = (r: Rating) => value === r;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        className={cn(
          btnStyle,
          is("maru") ? "border-blue-500 font-bold" : "border-gray-300"
        )}
        onClick={() => onChange("maru")}
        aria-pressed={is("maru")}
        aria-label="丸（○）"
      >
        ○
      </button>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          btnStyle,
          is("sankaku") ? "border-amber-500 font-bold" : "border-gray-300"
        )}
        onClick={() => onChange("sankaku")}
        aria-pressed={is("sankaku")}
        aria-label="三角（△）"
      >
        △
      </button>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          btnStyle,
          is("batsu") ? "border-rose-500 font-bold" : "border-gray-300"
        )}
        onClick={() => onChange("batsu")}
        aria-pressed={is("batsu")}
        aria-label="バツ（×）"
      >
        ×
      </button>
    </div>
  );
}

// シンプルな cn ヘルパ（なければ上で直接文字列結合でもOK）
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
