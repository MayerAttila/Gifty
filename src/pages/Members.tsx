import { useCallback, useEffect, useMemo, useState } from "react";
import AnimatedList from "../components/ui/AnimatedList";
import MemberCard, { type Member } from "../components/ui/MemberCard";
import AddMemberPanel from "../components/ui/AddMemberPanel";
import type { AddMemberFormValues } from "../types/add-member";

const MEMBERS_STORAGE_KEY = "gifty:members";

const reviveMember = (candidate: unknown): Member | null => {
  if (typeof candidate !== "object" || candidate === null) {
    return null;
  }
  const { id, name, gender, connection, likings, birthday, specialDates } =
    candidate as {
      id?: unknown;
      name?: unknown;
      gender?: unknown;
      connection?: unknown;
      likings?: unknown;
      birthday?: unknown;
      specialDates?: unknown;
    };

  if (
    typeof id !== "number" ||
    typeof name !== "string" ||
    typeof gender !== "string" ||
    typeof connection !== "string"
  ) {
    return null;
  }

  const datesMap = new Map<string, { label: string; date: Date }>();

  if (Array.isArray(specialDates)) {
    specialDates.forEach((entry) => {
      if (typeof entry !== "object" || entry === null) {
        return;
      }
      const { label, date } = entry as {
        label?: unknown;
        date?: unknown;
      };
      if (typeof label !== "string") {
        return;
      }
      const trimmedLabel = label.trim();
      if (!trimmedLabel) {
        return;
      }
      const parsed =
        date instanceof Date
          ? new Date(date.getTime())
          : typeof date === "string"
          ? new Date(date)
          : null;
      if (!parsed || Number.isNaN(parsed.getTime())) {
        return;
      }
      datesMap.set(trimmedLabel.toLowerCase(), {
        label: trimmedLabel,
        date: parsed,
      });
    });
  }

  if (typeof birthday === "string" || birthday instanceof Date) {
    const parsed =
      birthday instanceof Date
        ? new Date(birthday.getTime())
        : new Date(birthday);
    if (!Number.isNaN(parsed.getTime())) {
      datesMap.set("birthday", { label: "Birthday", date: parsed });
    }
  }

  const normalizedSpecialDates = Array.from(datesMap.values());

  return {
    id,
    name,
    gender,
    connection,
    ...(typeof likings === "string" ? { likings } : {}),
    ...(normalizedSpecialDates.length > 0
      ? { specialDates: normalizedSpecialDates }
      : {}),
  };
};

const loadMembersFromStorage = (): Member[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(MEMBERS_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map(reviveMember)
      .filter((member): member is Member => member !== null);
  } catch {
    return [];
  }
};

const ensureDateInstance = (value: Date | string): Date | null => {
  if (value instanceof Date) {
    const cloned = new Date(value.getTime());
    return Number.isNaN(cloned.getTime()) ? null : cloned;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const normalizeSpecialDatesFromForm = (
  specialDates: AddMemberFormValues["specialDates"],
  fallbackBirthday?: Date | string
): Member["specialDates"] | undefined => {
  const map = new Map<string, { label: string; date: Date }>();

  if (specialDates) {
    specialDates.forEach((entry) => {
      const label = entry.label?.trim();
      if (!label) {
        return;
      }
      const parsed = ensureDateInstance(entry.date);
      if (!parsed) {
        return;
      }
      map.set(label.toLowerCase(), { label, date: parsed });
    });
  }

  const birthdayCandidate = fallbackBirthday
    ? ensureDateInstance(fallbackBirthday)
    : null;

  if (birthdayCandidate && !map.has("birthday")) {
    map.set("birthday", { label: "Birthday", date: birthdayCandidate });
  }

  if (map.size === 0) {
    return undefined;
  }
  return Array.from(map.values());
};

const Members = () => {
  const [members, setMembers] = useState<Member[]>(loadMembersFromStorage);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      MEMBERS_STORAGE_KEY,
      JSON.stringify(members, (_, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      })
    );
  }, [members]);

  const nextMemberId = useMemo(() => {
    if (!members.length) {
      return 1;
    }
    return Math.max(...members.map((member) => member.id)) + 1;
  }, [members]);

  const handleDeleteMember = (id: number) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setIsAddMemberOpen(true);
  };

  const handleAddMember = useCallback(
    (data: AddMemberFormValues) => {
      const normalizedDates = normalizeSpecialDatesFromForm(data.specialDates);
      setMembers((prev) => [
        ...prev,
        {
          id: nextMemberId,
          name: data.name,
          gender: data.gender,
          connection: data.connection,
          ...(data.likings ? { likings: data.likings } : {}),
          ...(normalizedDates ? { specialDates: normalizedDates } : {}),
        },
      ]);
      setIsAddMemberOpen(false);
      setEditingMember(null);
    },
    [nextMemberId]
  );

  const handleUpdateMember = useCallback(
    (data: AddMemberFormValues) => {
      if (!editingMember) {
        return;
      }

      const existingBirthday =
        editingMember.specialDates?.find(
          (entry) => entry.label.toLowerCase() === "birthday"
        )?.date ?? null;

      const normalizedDates = normalizeSpecialDatesFromForm(
        data.specialDates,
        existingBirthday ?? undefined
      );

      setMembers((prev) =>
        prev.map((member) =>
          member.id === editingMember.id
            ? {
                id: member.id,
                name: data.name,
                gender: data.gender,
                connection: data.connection,
                ...(data.likings ? { likings: data.likings } : {}),
                ...(normalizedDates ? { specialDates: normalizedDates } : {}),
              }
            : member
        )
      );
      setIsAddMemberOpen(false);
      setEditingMember(null);
    },
    [editingMember]
  );

  const handleClosePanel = useCallback(() => {
    setIsAddMemberOpen(false);
    setEditingMember(null);
  }, []);

  return (
    <>
      <div className="flex min-h-[calc(98dvh-8rem)] flex-col gap-6">
        <AnimatedList<Member>
          items={members}
          showGradients={false}
          getItemKey={(member) => member.id}
          renderItem={(member, _index, isSelected) => (
            <MemberCard
              {...member}
              className={`${isSelected ? " bg-primary" : ""}`}
              onDelete={() => handleDeleteMember(member.id)}
              onEdit={() => handleEditMember(member)}
            />
          )}
          onItemSelect={(member) => {
            console.log("Selected member:", member);
          }}
          className="flex-1 w-full text-contrast"
          scrollContainerClassName="min-h-[22rem] max-h-[68vh] sm:max-h-[72vh] lg:max-h-[78vh] 2xl:max-h-[82vh]"
        />
        <div className="mt-auto px-3 pb-3">
          <button
            onClick={() => {
              setEditingMember(null);
              setIsAddMemberOpen(true);
            }}
            className="w-full rounded-xl border border-brand/70 bg-brand px-4 py-3 text-center font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-primary"
          >
            Add Member
          </button>
        </div>
      </div>
      <AddMemberPanel
        open={isAddMemberOpen}
        onClose={handleClosePanel}
        onSubmit={editingMember ? handleUpdateMember : handleAddMember}
        mode={editingMember ? "edit" : "create"}
        editingMember={editingMember}
      />
    </>
  );
};

export default Members;
