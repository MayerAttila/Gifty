import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

const addMonths = (date: Date, offset: number) =>
  new Date(date.getFullYear(), date.getMonth() + offset, 1);

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

const PAST_MONTHS = 6;
const FUTURE_MONTHS = 12;
const TOTAL_MONTHS = PAST_MONTHS + FUTURE_MONTHS + 1;

const buildMonthData = (month: Date, members: Member[]) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const eventsByDay = new Map<string, CalendarEvent[]>();

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
      if (occurrence.getMonth() !== monthIndex) {
        return;
      }

      const key = toDateKey(occurrence);
      const entries = eventsByDay.get(key) ?? [];
      entries.push({
        memberName: member.name,
        label: occasion.label,
        originalDate: base,
      });
      eventsByDay.set(key, entries);
    });
  });

  Array.from(eventsByDay.values()).forEach((list) =>
    list.sort((a, b) => a.memberName.localeCompare(b.memberName))
  );

  const visibleDays = createMonthMatrix(year, monthIndex);

  const monthlyEvents = Array.from(eventsByDay.entries())
    .flatMap(([key, events]) => {
      const [yyyy, mm, dd] = key.split("-").map(Number);
      const occurrence = new Date(yyyy, (mm ?? 1) - 1, dd ?? 1);
      return events.map((event, index) => ({
        key: `${key}-${event.memberName}-${event.label}-${index}`,
        memberName: event.memberName,
        label: event.label,
        occurrence,
      }));
    })
    .sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime());

  return {
    month,
    visibleDays,
    eventsByDay,
    monthlyEvents,
  };
};

const Calendar = () => {
  const [members, setMembers] = useState<Member[]>(loadMembersFromStorage);

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

  const monthRailRef = useRef<HTMLDivElement | null>(null);
  const animationFrame = useRef<number | null>(null);
  const [activeMonthIndex, setActiveMonthIndex] = useState(PAST_MONTHS);

  const todayKey = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return toDateKey(today);
  }, []);

  const monthAnchors = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return Array.from({ length: TOTAL_MONTHS }, (_, index) => {
      const offset = index - PAST_MONTHS;
      const monthDate = addMonths(currentMonth, offset);
      return {
        id: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
        date: monthDate,
      };
    });
  }, []);

  const monthsData = useMemo(
    () => monthAnchors.map((anchor) => buildMonthData(anchor.date, members)),
    [monthAnchors, members]
  );

  const activeMonthData =
    monthsData[activeMonthIndex] ?? monthsData[monthsData.length - 1];

  const monthEvents = activeMonthData?.monthlyEvents ?? [];

  const scrollToMonth = useCallback(
    (targetIndex: number, behavior: ScrollBehavior = "smooth") => {
      const container = monthRailRef.current;
      if (!container || monthsData.length === 0) {
        return;
      }
      const clamped = Math.max(0, Math.min(targetIndex, monthsData.length - 1));
      const targetNode = container.children.item(clamped) as
        | HTMLElement
        | null;
      if (!targetNode) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetNode.getBoundingClientRect();
      const isHorizontal = container.scrollWidth > container.clientWidth + 1;

      const options: ScrollToOptions = { behavior };
      if (isHorizontal) {
        const delta =
          targetRect.left -
          containerRect.left -
          (containerRect.width - targetRect.width) / 2;
        options.left = container.scrollLeft + delta;
      } else {
        options.top =
          container.scrollTop + (targetRect.top - containerRect.top);
      }
      container.scrollTo(options);

      if (clamped !== activeMonthIndex) {
        setActiveMonthIndex(clamped);
      }
    },
    [activeMonthIndex, monthsData.length]
  );

  const monthLabel = useMemo(() => {
    if (!activeMonthData) {
      return "Select a month";
    }
    return activeMonthData.month.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [activeMonthData]);

  useEffect(() => {
    scrollToMonth(activeMonthIndex, "auto");
  }, [activeMonthIndex, monthsData.length, scrollToMonth]);

  useEffect(() => {
    const handleResize = () => {
      scrollToMonth(activeMonthIndex);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeMonthIndex, scrollToMonth]);

  const handleRailScroll = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    animationFrame.current = requestAnimationFrame(() => {
      const container = monthRailRef.current;
      if (!container) {
        return;
      }
      const children = Array.from(
        container.children
      ) as HTMLElement[];
      if (children.length === 0) {
        return;
      }
      const isHorizontal = container.scrollWidth > container.clientWidth + 1;
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;

      let closestIndex = activeMonthIndex;
      let smallestDistance = Number.POSITIVE_INFINITY;

      children.forEach((child, index) => {
        const rect = child.getBoundingClientRect();
        const distance = isHorizontal
          ? Math.abs(
              rect.left + rect.width / 2 - containerCenterX
            )
          : Math.abs(rect.top - containerRect.top);
        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== activeMonthIndex) {
        setActiveMonthIndex(closestIndex);
      }
    });
  }, [activeMonthIndex]);

  useEffect(
    () => () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    },
    []
  );

  return (
    <div className="flex flex-col gap-8 text-contrast">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-brand">
            Calendar
          </h1>
          <p className="text-sm text-contrast/70 max-w-md">
            Highlighting special dates for your members.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-brand shadow-sm">
            {monthLabel}
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollToMonth(activeMonthIndex - 1)}
              disabled={activeMonthIndex === 0}
              className={[
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                activeMonthIndex === 0
                  ? "cursor-not-allowed border-accent-2/60 text-contrast/40"
                  : "border-accent-2/60 text-contrast hover:border-brand/70 hover:text-brand",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => scrollToMonth(activeMonthIndex + 1)}
              disabled={activeMonthIndex === monthsData.length - 1}
              className={[
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                activeMonthIndex === monthsData.length - 1
                  ? "cursor-not-allowed border-accent-2/60 text-contrast/40"
                  : "border-accent-2/60 text-contrast hover:border-brand/70 hover:text-brand",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              Next
            </button>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-wider text-contrast/50 md:hidden">
          Scroll to move between months
        </p>
        <div
          ref={monthRailRef}
          onScroll={handleRailScroll}
          className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex max-h-[72vh] snap-y snap-mandatory flex-col gap-4 overflow-y-auto overflow-x-hidden pb-2 md:max-h-none md:flex-row md:snap-x md:overflow-y-hidden md:overflow-x-auto"
        >
          {monthsData.map((monthData, index) => (
            <article
              key={monthData.month.getTime()}
              className={[
                "w-full flex-shrink-0 snap-start snap-always rounded-2xl bg-primary p-3 shadow-sm",
                "min-h-[60vh]",
                "md:min-h-0 md:min-w-full md:max-w-full md:snap-center md:p-4",
                index === activeMonthIndex
                  ? "border border-brand/40"
                  : "border border-transparent opacity-70",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="grid grid-cols-7 gap-1 text-[10px] font-semibold uppercase tracking-wider text-contrast/60 sm:text-[11px] md:gap-2 md:text-xs">
                {DAY_LABELS.map((label) => (
                  <span key={label} className="text-center">
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1 text-[11px] sm:text-xs md:gap-2 md:text-sm">
                {monthData.visibleDays.map(({ date, isCurrentMonth, key }) => {
                  const events = monthData.eventsByDay.get(key) ?? [];
                  const hasEvents = events.length > 0;
                  const isToday = key === todayKey;
                  const dayNumberClass = isCurrentMonth
                    ? "text-[13px] font-semibold text-contrast/80 md:text-sm"
                    : "text-[13px] font-semibold text-contrast/40 md:text-sm";
                  const badgeClass = isCurrentMonth
                    ? "rounded-full bg-brand/20 px-1 py-0.5 text-[9px] font-medium text-brand md:px-1.5 md:text-[10px]"
                    : "rounded-full bg-accent-3/40 px-1 py-0.5 text-[9px] font-medium text-contrast/40 md:px-1.5 md:text-[10px]";
                  const eventItemClass = isCurrentMonth
                    ? "rounded-md bg-brand/15 px-1.5 py-1 text-brand"
                    : "rounded-md bg-accent-2/50 px-1.5 py-1 text-contrast/40";
                  const eventLabelClass = isCurrentMonth
                    ? "text-contrast/70"
                    : "text-contrast/40";
                  const moreLabelClass = isCurrentMonth
                    ? "text-[9px] font-medium text-brand/80"
                    : "text-[9px] font-medium text-contrast/40";

                  return (
                    <div
                      key={key}
                      className={[
                        "relative flex h-16 flex-col items-center justify-center rounded-lg border p-1 transition md:h-auto md:items-stretch md:justify-start md:min-h-[96px] md:p-2",
                        isCurrentMonth
                          ? "border-accent-2/60 bg-primary/80"
                          : "border-transparent bg-accent-2/20 text-contrast/40",
                        hasEvents ? "border-brand/60 bg-brand/10" : "",
                        isToday ? "ring-1 ring-brand/70" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-1 md:hidden">
                        <span className={dayNumberClass}>
                          {date.getDate()}
                        </span>
                      </div>
                      {hasEvents ? (
                        <span className={`${badgeClass} absolute right-1 top-1 md:hidden`}>
                          {events.length}
                        </span>
                      ) : null}
                      <div className="hidden items-center justify-between md:flex">
                        <span className={dayNumberClass}>
                          {date.getDate()}
                        </span>
                        {hasEvents ? (
                          <span className={badgeClass}>{events.length}</span>
                        ) : null}
                      </div>
                      {hasEvents ? (
                        <ul className="mt-1 hidden flex-col gap-0.5 text-[10px] leading-tight md:flex">
                          {events.slice(0, 2).map((event, entryIndex) => (
                            <li
                              key={`${event.memberName}-${event.label}-${entryIndex}`}
                              className={eventItemClass}
                            >
                              <span className="font-semibold">
                                {event.memberName}
                              </span>
                              <span className={eventLabelClass}>
                                {`: ${event.label}`}
                              </span>
                            </li>
                          ))}
                          {events.length > 2 ? (
                            <li className={moreLabelClass}>
                              +{events.length - 2} more
                            </li>
                          ) : null}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-primary p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-contrast">This Month</h2>
        {monthEvents.length === 0 ? (
          <p className="mt-2 text-sm text-contrast/70">
            No special dates in this month yet. Add members with occasions to
            see them highlighted here.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-contrast/80">
            {monthEvents.map((event) => (
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
