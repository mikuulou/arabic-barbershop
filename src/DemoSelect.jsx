import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export default function DemoSelect({ label, value, options, onChange }) {
  const id = useId();
  const root = useRef(null);
  const trigger = useRef(null);
  const search = useRef({ text: '', at: 0 });
  const [open, setOpen] = useState(false);
  const selected = Math.max(0, options.findIndex(option => option.value === value));
  const [active, setActive] = useState(selected);
  useEffect(() => {
    if (!open) return;
    const outside = event => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id]);
  function choose(index) {
    onChange(options[index].value);
    setOpen(false);
    trigger.current?.focus();
  }
  function onKeyDown(event) {
    const { key } = event;
    if (key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (key === 'Tab') { setOpen(false); return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      event.preventDefault();
      setOpen(true);
      setActive(key === 'Home' ? 0 : key === 'End' ? options.length - 1 : !open ? selected : (active + (key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (open) choose(active);
      else { setActive(selected); setOpen(true); }
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      search.current.text = (now - search.current.at < 700 ? search.current.text : '') + key.toLocaleLowerCase('uk-UA');
      search.current.at = now;
      const match = options.findIndex(option => option.label.toLocaleLowerCase('uk-UA').startsWith(search.current.text));
      if (match !== -1) { setActive(match); setOpen(true); }
    }
  }
  return <div className="demo-select-field" ref={root} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <span id={`${id}-label`} className="demo-select-label">{label}</span>
    <button ref={trigger} type="button" role="combobox" className="demo-select-trigger"
      aria-labelledby={`${id}-label ${id}-value`} aria-expanded={open} aria-haspopup="listbox"
      aria-controls={open ? `${id}-list` : undefined}
      aria-activedescendant={open ? `${id}-option-${active}` : undefined}
      onKeyDown={onKeyDown} onClick={() => { setActive(selected); setOpen(!open); }}>
      <span id={`${id}-value`}>{options[selected].label}</span><ChevronDown size={16} aria-hidden="true"/>
    </button>
    {open && <div id={`${id}-list`} className="demo-select-options" role="listbox" aria-labelledby={`${id}-label`}>
      {options.map((option, index) => <div key={option.value} id={`${id}-option-${index}`}
        role="option" aria-selected={option.value === value}
        className={`demo-select-option${index === active ? ' active' : ''}`}
        onPointerDown={event => event.preventDefault()} onPointerMove={() => setActive(index)}
        onClick={() => choose(index)}>
        <span>{option.label}</span>{option.value === value && <Check size={15} aria-hidden="true"/>}
      </div>)}
    </div>}
  </div>;
}
