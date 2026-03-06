import { useState } from 'react';
import { schedule, getInitialDayId } from './data/schedule';
import { Header } from './components/Header';
import { DaySelector } from './components/DaySelector';
import { ScheduleList } from './components/ScheduleList';

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(getInitialDayId);

  const selectedDay = schedule.find((d) => d.id === selectedId) ?? schedule[0];

  return (
    <div className="min-h-screen bg-[#f8f7f5] max-w-md mx-auto">
      <Header />
      <DaySelector
        days={schedule}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <ScheduleList day={selectedDay} />
    </div>
  );
}
