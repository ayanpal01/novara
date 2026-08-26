'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionValue {
  label: string;
  value: string;
  hex?: string;
}

interface Option {
  name: string;
  values: OptionValue[];
}

interface ProductVariantSelectorProps {
  options: Option[];
  selectedOptions: Record<string, string>;
  onSelectOption: (optionName: string, value: string) => void;
  getIsAvailable: (optionName: string, value: string) => boolean;
}

export default function ProductVariantSelector({
  options,
  selectedOptions,
  onSelectOption,
  getIsAvailable
}: ProductVariantSelectorProps) {

  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-6">
      {options.map((option) => {
        const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour';
        
        return (
          <div key={option.name}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {option.name}
              </h3>
              {option.name.toLowerCase() === 'size' && (
                <button className="text-xs font-semibold underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                  Size Guide
                </button>
              )}
            </div>
            
            {isColor ? (
              <div className="flex flex-wrap gap-3">
                {option.values.map((val) => {
                  const selected = selectedOptions[option.name] === val.value;
                  const available = getIsAvailable(option.name, val.value);
                  
                  return (
                    <div key={val.value} className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => onSelectOption(option.name, val.value)}
                        disabled={!available}
                        className={cn(
                          "relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                          selected ? "border-foreground" : "border-transparent hover:scale-105",
                          !available && "opacity-40 cursor-not-allowed hover:scale-100"
                        )}
                        title={val.label}
                      >
                        <span 
                          className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center"
                          style={{ backgroundColor: val.hex || val.value.toLowerCase() }}
                        >
                          {selected && (
                            <Check size={14} className={
                              // rudimentary check for light/dark to set icon color
                              val.hex && ['#ffffff', '#fff'].includes(val.hex.toLowerCase()) ? "text-black" : "text-white"
                            } />
                          )}
                        </span>
                        {!available && (
                          <div className="absolute inset-0 flex items-center justify-center rotate-45">
                            <div className="w-full h-px bg-foreground/50" />
                          </div>
                        )}
                      </button>
                      <span className={cn("text-[10px] uppercase font-semibold tracking-wider", selected ? "text-foreground" : "text-muted-foreground")}>
                        {val.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {option.values.map((val) => {
                  const selected = selectedOptions[option.name] === val.value;
                  const available = getIsAvailable(option.name, val.value);

                  return (
                    <button
                      key={val.value}
                      disabled={!available}
                      onClick={() => onSelectOption(option.name, val.value)}
                      className={cn(
                        "relative min-w-[3rem] px-4 py-3 text-sm font-semibold border rounded-md transition-all overflow-hidden uppercase tracking-wider",
                        selected 
                          ? "border-foreground bg-foreground text-background" 
                          : "border-input bg-background text-foreground hover:border-foreground/50",
                        !available && "opacity-40 cursor-not-allowed hover:border-input bg-muted/50"
                      )}
                    >
                      {val.label}
                      {!available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-px bg-foreground/20 -rotate-45 scale-150" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
