import { useQuery } from "@tanstack/react-query";

export default function IslamicReminder() {
  const { data: reminder } = useQuery<any>({
    queryKey: ["/api/islamic-reminders/daily"],
    refetchInterval: 1000 * 60 * 60, // Refresh every hour
  });

  if (!reminder) {
    return (
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Daily Islamic Reminder</h3>
            <p className="opacity-90 mb-3" data-testid="text-daily-reminder">
              "And it is He who created the heavens and earth in truth. And the day He says, 'Be,' and it is, His word is the truth." - Quran 6:73
            </p>
            <div className="text-sm opacity-75">
              Today's Prayer Times: <span data-testid="text-prayer-times">Fajr 5:30 AM | Dhuhr 12:15 PM | Asr 3:45 PM | Maghrib 6:20 PM | Isha 7:45 PM</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <i className="fas fa-mosque text-3xl opacity-50"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">{reminder?.title || 'Daily Islamic Reminder'}</h3>
          <p className="opacity-90 mb-3" data-testid="text-daily-reminder">{reminder?.content || 'Remember Allah in all your actions.'}</p>
          {reminder?.source && (
            <div className="text-sm opacity-75">Source: {reminder.source}</div>
          )}
        </div>
        <div className="hidden sm:block">
          <i className="fas fa-mosque text-3xl opacity-50"></i>
        </div>
      </div>
    </div>
  );
}
