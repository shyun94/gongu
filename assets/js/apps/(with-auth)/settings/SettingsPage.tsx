import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InvitationSection } from "./InvitationSection";

export const SettingsPage: React.FC = () => {
  return (
    <div className="w-full h-full bg-white">
      <div className="relative flex items-center justify-center p-3 border-b border-gray-200">
        <Link
          to="/budget-calendar"
          className="absolute left-3 top-1/2 -translate-y-1/2"
        >
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="뒤로"
          >
            <span className="text-base">←</span>
          </button>
        </Link>
        <h2 className="text-lg font-semibold text-gray-900">설정</h2>
      </div>

      <div className="p-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="invitation">
            <AccordionTrigger className="text-base font-medium text-gray-900">
              초대코드
            </AccordionTrigger>
            <AccordionContent>
              <InvitationSection />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default SettingsPage;
