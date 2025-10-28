import type { ComponentPropsWithoutRef } from "react";

export type UpcomingEvent = {
  key: string;
  memberName: string;
  label: string;
  occurrence: Date;
};

type UpcomingEventsProps = {
  title?: string;
  emptyMessage?: string;
  events: UpcomingEvent[];
  tagLabel?: string;
} & ComponentPropsWithoutRef<"section">;

const UpcomingEvents = ({
  title = "This Month",
  emptyMessage = "No upcoming events for this month.",
  events,
  tagLabel,
  className = "",
  ...rest
}: UpcomingEventsProps) => {
  return (
    <section
      className={[
        "rounded-xl bg-primary p-4 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-contrast">{title}</h2>
        {tagLabel ? (
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
            {tagLabel}
          </span>
        ) : null}
      </div>
      {events.length === 0 ? (
        <p className="mt-2 text-sm text-contrast/70">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-contrast/80">
          {events.map((event) => (
            <li
              key={event.key}
              className="flex items-center justify-between rounded-lg border border-accent-2/50 px-3 py-2"
            >
              <div>
                <p className="font-semibold text-brand">{event.memberName}</p>
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
  );
};

export default UpcomingEvents;
