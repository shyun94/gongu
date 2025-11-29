import React from "react";
import { useListCalendars } from "./useListCalendars";

export const CalendarPage: React.FC = () => {
  const { data: calendars, isLoading, error } = useListCalendars();

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        <p className="text-red-500">Error loading calendars</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Calendar</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(calendars, null, 2)}
      </pre>
    </div>
  );
};

export default CalendarPage;

