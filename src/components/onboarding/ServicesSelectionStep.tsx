/**
 * Services Selection Step for Therapist Onboarding
 * Allows therapists to select services they offer
 */

"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import { AVAILABLE_SERVICES, SERVICE_CATEGORIES, type ServiceCategory } from "@/types/models/service";

interface ServicesSelectionStepProps {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
}

export function ServicesSelectionStep({
  selectedServices,
  onServicesChange,
}: ServicesSelectionStepProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      onServicesChange(selectedServices.filter((id) => id !== serviceId));
    } else {
      onServicesChange([...selectedServices, serviceId]);
    }
  };

  const filteredServices = activeCategory === "all"
    ? AVAILABLE_SERVICES
    : AVAILABLE_SERVICES.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Select Services You Offer</h3>
        <p className="text-gray-600 text-sm">
          Choose all the services you provide to clients (select at least one)
        </p>
        <p className="text-sm text-blue-600 mt-2">
          {selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge
          variant={activeCategory === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setActiveCategory("all")}
        >
          All Services
        </Badge>
        {SERVICE_CATEGORIES.map((cat) => (
          <Badge
            key={cat.value}
            variant={activeCategory === cat.value ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveCategory(cat.value as ServiceCategory)}
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-2">
        {filteredServices.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          return (
            <div
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedServices.length === 0 && (
        <div className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Please select at least one service to continue
        </div>
      )}
    </div>
  );
}
