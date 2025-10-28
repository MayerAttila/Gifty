import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Member } from "../types/add-member";
import {
  MEMBERS_STORAGE_KEY,
  MEMBERS_UPDATED_EVENT,
  loadMembersFromStorage,
} from "../utils/member-storage";

type CalendarEvent = {
  memberName: string;
  label: string;
  originalDate: Date;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (value: number) => value.toString().padStart(2, "0");

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const createMonthMatrix = (year: number, month: number) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - startWeekday;
    const date = new Date(year, month, 1 + dayOffset);
    return {
      date,
      isCurrentMonth: date.getMonth() === month,
      key: toDateKey(date),
    };
  });
};

const Calendar = () => {
  const [members, setMembers] = useState<Member[]>(loadMembersFromStorage);
  const [activeMonth, setActiveMonth] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    const updateMembers = () => {
      setMembers(loadMembersFromStorage());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === MEMBERS_STORAGE_KEY) {
        updateMembers();
      }
    };

    window.addEventListener(MEMBERS_UPDATED_EVENT, updateMembers);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(MEMBERS_UPDATED_EVENT, updateMembers);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const todayKey = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return toDateKey(today);
  }, []);

  const eventsByDay = useMemo(() => {
    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();
    const scheduled = new Map<string, CalendarEvent[]>();

    members.forEach((member) => {
      member.specialDates?.forEach((occasion) => {
        const base =
          occasion.date instanceof Date
            ? new Date(occasion.date.getTime())
            : new Date(occasion.date);

        if (Number.isNaN(base.getTime())) {
          return;
        }

        const occurrence = new Date(year, base.getMonth(), base.getDate());
        if (occurrence.getMonth() !== base.getMonth()) {
          return;
        }
        if (occurrence.getMonth() !== month) {
          return;
        }

        const key = toDateKey(occurrence);
        const entries = scheduled.get(key) ?? [];
        entries.push({
          memberName: member.name,
          label: occasion.label,
          originalDate: base,
        });
        scheduled.set(key, entries);
      });
    });

    Array.from(scheduled.values()).forEach((list) =>
      list.sort((a, b) => a.memberName.localeCompare(b.memberName))
    );

    return scheduled;
  }, [activeMonth, members]);

  const visibleDays = useMemo(() => {
    return createMonthMatrix(
      activeMonth.getFullYear(),
      activeMonth.getMonth()
    );
  }, [activeMonth]);

  const monthlyEvents = useMemo(() => {
    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();

    const items: Array<{
      key: string;
      memberName: string;
      label: string;
      occurrence: Date;
    }> = [];

    members.forEach((member) => {
      member.specialDates?.forEach((occasion) => {
        const base =
          occasion.date instanceof Date
            ? new Date(occasion.date.getTime())
            : new Date(occasion.date);

        if (Number.isNaN(base.getTime()) || base.getMonth() !== month) {
          return;
        }

        const occurrence = new Date(year, base.getMonth(), base.getDate());
        if (occurrence.getMonth() !== base.getMonth()) {
          return;
        }

        items.push({
          key: `${member.id}-${occasion.label}-${base.getTime()}`,
          memberName: member.name,
          label: occasion.label,
          occurrence,
        });
      });
    });

    return items.sort(
      (a, b) => a.occurrence.getTime() - b.occurrence.getTime()
    );
  }, [activeMonth, members]);

  const changeMonth = useCallback(
    (offset: number) => {
      setActiveMonth((current) => {
        const next = new Date(
          current.getFullYear(),
          current.getMonth() + offset,
          1
        );
        next.setHours(0, 0, 0, 0);
        return next;
      });
    },
    []
  );

  const monthLabel = useMemo(() => {
    return activeMonth.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [activeMonth]);

  return (
    <div className="flex flex-col gap-8 text-contrast">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand">
            Calendar
          </h1>
          <p className="text-sm text-contrast/70">
            Highlighting special dates for your members.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="rounded-lg border border-accent-2/60 px-3 py-1.5 text-sm font-medium text-contrast transition hover:border-brand/70 hover:text-brand"
          >
            Previous
          </button>
          <div className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-brand shadow-sm">
            {monthLabel}
          </div>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="rounded-lg border border-accent-2/60 px-3 py-1.5 text-sm font-medium text-contrast transition hover:border-brand/70 hover:text-brand"
          >
            Next
          </button>
        </div>
      </header>

      <section className="flex flex-col gap-3 rounded-xl bg-primary p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-2 text-xs font-semibold uppercase tracking-wider text-contrast/60">
          {DAY_LABELS.map((label) => (
            <span key={label} className="px-2 text-center">
              {label}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 text-sm">
          {visibleDays.map(({ date, isCurrentMonth, key }) => {
            const events = eventsByDay.get(key) ?? [];
            const hasEvents = events.length > 0;
            const isToday = key === todayKey;

            return (
              <div
                key={key}
                className={[
                  "min-h-[92px] rounded-xl border p-2 transition",
                  isCurrentMonth
                    ? "border-accent-2/60 bg-primary/80"
                    : "border-transparent bg-primary/40 text-contrast/40",
                  hasEvents ? "border-brand/60 bg-brand/10" : "",
                  !hasEvents && isCurrentMonth
                    ? "hover:border-brand/50 hover:bg-brand/5"
                    : "",
                  isToday ? "ring-1 ring-brand/70" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-contrast/80">
                    {date.getDate()}
                  </span>
                  {hasEvents ? (
                    <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[11px] font-medium text-brand">
                      {events.length}
                    </span>
                  ) : null}
                </div>
                {hasEvents ? (
                  <div className="mt-2 flex flex-col gap-1 text-[11px] leading-tight">
                    {events.slice(0, 3).map((event, index) => (
                      <div
                        key={`${event.memberName}-${event.label}-${index}`}
                        className="rounded-md bg-brand/15 px-2 py-1 text-brand"
                      >
                        <span className="font-semibold">{event.memberName}</span>
                        <span className="text-contrast/70">
                          {`: ${event.label}`}
                        </span>
                      </div>
                    ))}
                    {events.length > 3 ? (
                      <span className="text-[10px] font-medium text-brand/80">
                        +{events.length - 3} more
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl bg-primary p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-contrast">This Month</h2>
        {monthlyEvents.length === 0 ? (
          <p className="mt-2 text-sm text-contrast/70">
            No special dates in this month yet. Add members with occasions to
            see them highlighted here.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-contrast/80">
            {monthlyEvents.map((event) => (
              <li
                key={event.key}
                className="flex items-center justify-between rounded-lg border border-accent-2/50 px-3 py-2"
              >
                <div>
                  <p className="font-semibold text-brand">
                    {event.memberName}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-contrast/60">
                    {event.label}
                  </p>
                </div>
                <span className="text-sm font-medium text-contrast/80">
                  {event.occurrence.toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    weekday: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Calendar;
