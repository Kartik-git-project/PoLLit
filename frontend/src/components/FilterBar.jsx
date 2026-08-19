import React from 'react'
import { filterBarStyles as s } from '../assets/dummyStyles'
import { Image, List, MessageSquare, Scale, Sparkles, Star, X } from 'lucide-react';

export const TYPE_META = {
  yesno: { label: "Yes / No", Icon: Scale },
  single: { label: "Single Choice", Icon: List },
  rating: { label: "Rating", Icon: Star },
  image: { label: "Image", Icon: Image },
  open: { label: "Open Ended", Icon: MessageSquare },
}; 

export const FILTERS = [
  { key: "all", label: "All", Icon: Sparkles },
  ...Object.entries(TYPE_META).map(([key, v]) => ({
    key,
    label: v.label,
    Icon: v.Icon,
  })),
];

const FilterBar = ({ value, onChange }) => {
  return (
    <div className={s.container}>
      {FILTERS.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`${s.filterButtonBase} ${
            value === key ? s.filterButtonActive : s.filterButtonInactive
          }`}
        >
          <Icon size={12} /> {label}
        </button>
      ))}

      {value !== "all" && (
        <button onClick={() => onChange("all")} className={s.clearButton}>
          <X size={11} /> Clear
        </button>
      )}
    </div>
  )
}

export default FilterBar