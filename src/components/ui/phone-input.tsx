"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import {
  COUNTRY_DIAL_CODES,
  DEFAULT_COUNTRY_ISO,
  buildE164,
  formatDialCodeLabel,
  getCountryByIso,
  getCountryFlag,
  nationalNumberMaxLength,
  parsePhoneValue,
  type CountryDialCode,
} from "@/lib/country-codes";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  id?: string;
  value?: string;
  onChange: (e164: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  placeholder?: string;
}

export function PhoneInput({
  id,
  value,
  onChange,
  disabled,
  invalid,
  className,
  placeholder = "Mobile number",
}: PhoneInputProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIso, setSelectedIso] = useState(DEFAULT_COUNTRY_ISO);

  const parsed = useMemo(() => parsePhoneValue(value), [value]);
  const country =
    getCountryByIso(selectedIso) ??
    parsed.country ??
    getCountryByIso(DEFAULT_COUNTRY_ISO)!;
  const national = parsed.nationalNumber;

  // Keep selected country in sync when parent value already includes a dial code
  // (e.g. edit form). Prefer explicit user selection while typing a national number.
  const countryForUi = value?.trim().startsWith("+")
    ? parsed.country
    : country;

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [open]);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const india = getCountryByIso(DEFAULT_COUNTRY_ISO)!;

    if (!q) {
      const rest = COUNTRY_DIAL_CODES.filter(
        (item) => item.iso !== DEFAULT_COUNTRY_ISO,
      ).sort((a, b) => a.name.localeCompare(b.name));
      return [india, ...rest];
    }

    return COUNTRY_DIAL_CODES.filter((item) => {
      const haystack =
        `${item.name} ${item.dialCode} +${item.dialCode} ${item.iso}`.toLowerCase();
      return haystack.includes(q);
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  function emit(nextCountry: CountryDialCode, nextNational: string) {
    onChange(buildE164(nextCountry.dialCode, nextNational));
  }

  function selectCountry(next: CountryDialCode) {
    setSelectedIso(next.iso);
    const max = nationalNumberMaxLength(next.iso);
    const clipped = national.slice(0, max);
    emit(next, clipped);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-8 overflow-hidden rounded-lg border border-input bg-white transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          invalid &&
            "border-destructive ring-3 ring-destructive/20 focus-within:border-destructive focus-within:ring-destructive/20",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <button
          type="button"
          disabled={disabled}
          aria-label="Select country code"
          aria-expanded={open}
          className="inline-flex shrink-0 items-center gap-1.5 border-r border-input bg-slate-50 px-2.5 text-sm hover:bg-slate-100"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="text-base leading-none" aria-hidden>
            {getCountryFlag(countryForUi.iso)}
          </span>
          <span className="font-medium tabular-nums text-foreground">
            {formatDialCodeLabel(countryForUi.dialCode)}
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          disabled={disabled}
          aria-invalid={invalid}
          placeholder={
            countryForUi.iso === "IN" ? "10-digit mobile number" : placeholder
          }
          maxLength={nationalNumberMaxLength(countryForUi.iso)}
          value={national}
          className="h-8 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground"
          onChange={(event) => {
            const digits = event.target.value
              .replace(/\D/g, "")
              .slice(0, nationalNumberMaxLength(countryForUi.iso));
            emit(countryForUi, digits);
          }}
        />
      </div>

      {open ? (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-[min(100%,22rem)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search country or code"
                className="h-8 w-full rounded-lg border border-input bg-background py-1 pr-2.5 pl-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <p className="mt-2 truncate px-1 text-xs text-muted-foreground">
              {getCountryFlag(countryForUi.iso)} {countryForUi.name} (
              {formatDialCodeLabel(countryForUi.dialCode)})
            </p>
          </div>

          <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
            {filteredCountries.length ? (
              filteredCountries.map((item) => {
                const selected = item.iso === countryForUi.iso;
                return (
                  <li key={`${item.iso}-${item.dialCode}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        selected &&
                          "bg-secondary text-white hover:bg-secondary hover:text-white",
                      )}
                      onClick={() => selectCountry(item)}
                    >
                      <span className="text-base leading-none" aria-hidden>
                        {getCountryFlag(item.iso)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {item.name}{" "}
                        <span
                          className={cn(
                            selected ? "text-white/80" : "text-muted-foreground",
                          )}
                        >
                          ({formatDialCodeLabel(item.dialCode)})
                        </span>
                      </span>
                      {selected ? (
                        <Check className="size-3.5 shrink-0" />
                      ) : null}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                No countries found
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
