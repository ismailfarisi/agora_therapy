/**
 * Language Multi-Select Component
 * Allows selection of multiple languages with search and grouping
 */

"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Search, Check } from "lucide-react";
import { LANGUAGES, LANGUAGE_GROUPS, POPULAR_INDIAN_LANGUAGES, getLanguageName } from "@/lib/constants/languages";

interface LanguageMultiSelectProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function LanguageMultiSelect({
  selectedLanguages,
  onLanguagesChange,
  label = "Languages",
  placeholder = "Search languages...",
}: LanguageMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      onLanguagesChange(selectedLanguages.filter((c) => c !== code));
    } else {
      onLanguagesChange([...selectedLanguages, code]);
    }
  };

  const removeLanguage = (code: string) => {
    onLanguagesChange(selectedLanguages.filter((c) => c !== code));
  };

  const addPopularLanguages = () => {
    const newLanguages = [...new Set([...selectedLanguages, ...POPULAR_INDIAN_LANGUAGES])];
    onLanguagesChange(newLanguages);
  };

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedFilteredLanguages = filteredLanguages.reduce((acc, lang) => {
    if (!acc[lang.region]) {
      acc[lang.region] = [];
    }
    acc[lang.region].push(lang);
    return acc;
  }, {} as Record<string, typeof LANGUAGES>);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addPopularLanguages}
          className="text-xs"
        >
          Add Popular Indian Languages
        </Button>
      </div>

      {/* Selected Languages */}
      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
          {selectedLanguages.map((code) => (
            <Badge key={code} variant="secondary" className="flex items-center gap-1">
              {getLanguageName(code)}
              <button
                type="button"
                onClick={() => removeLanguage(code)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className="pl-10"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="relative">
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
            <div className="p-2">
              <div className="flex justify-between items-center mb-2 pb-2 border-b">
                <span className="text-sm font-medium text-gray-700">
                  {selectedLanguages.length} selected
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDropdown(false)}
                  className="h-6 px-2"
                >
                  Done
                </Button>
              </div>

              {Object.entries(groupedFilteredLanguages).map(([region, languages]) => (
                <div key={region} className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase px-2 py-1 bg-gray-50 rounded">
                    {region}
                  </div>
                  <div className="mt-1 space-y-1">
                    {languages.map((lang) => {
                      const isSelected = selectedLanguages.includes(lang.code);
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => toggleLanguage(lang.code)}
                          className={`
                            w-full flex items-center justify-between px-3 py-2 rounded
                            hover:bg-gray-50 transition-colors text-left
                            ${isSelected ? "bg-blue-50" : ""}
                          `}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{lang.name}</div>
                            {lang.nativeName && (
                              <div className="text-xs text-gray-500">{lang.nativeName}</div>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredLanguages.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No languages found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      <p className="text-xs text-gray-500">
        Select all languages you can provide therapy in
      </p>
    </div>
  );
}
