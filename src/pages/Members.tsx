import { useCallback, useEffect, useMemo, useState } from "react";
import AnimatedList from "../components/ui/AnimatedList";
import MemberCard, { type Member } from "../components/ui/MemberCard";
import AddMemberPanel from "../components/ui/AddMemberPanel";
import type { AddMemberFormValues } from "../components/ui/AddMemberTypes";

const MEMBERS_STORAGE_KEY = "gifty:members";

const reviveMember = (candidate: unknown): Member | null => {
  if (typeof candidate !== "object" || candidate === null) {
    return null;
  }
  const {
    id,
    name,
    gender,
    connection,
    likings,
    birthday,
    specialDates,
  } = candidate as {
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

  let normalizedBirthday: Date | undefined;
  if (typeof birthday === "string" || birthday instanceof Date) {
    const parsed =
      birthday instanceof Date ? birthday : new Date(birthday as string);
    if (!Number.isNaN(parsed.getTime())) {
      normalizedBirthday = parsed;
    }
  }

  let normalizedSpecialDates: Member["specialDates"];
  if (Array.isArray(specialDates)) {
    const revived = specialDates
      .map((entry) => {
        if (typeof entry !== "object" || entry === null) {
          return null;
        }
        const { label, date } = entry as {
          label?: unknown;
          date?: unknown;
        };
        if (typeof label !== "string") {
          return null;
        }
        if (typeof date !== "string" && !(date instanceof Date)) {
          return null;
        }
        const parsed = date instanceof Date ? date : new Date(date);
        if (Number.isNaN(parsed.getTime())) {
          return null;
        }
        return { label, date: parsed };
      })
      .filter(
        (entry): entry is { label: string; date: Date } => entry !== null
      );
    if (revived.length > 0) {
      normalizedSpecialDates = revived;
    }
  }

  return {
    id,
    name,
    gender,
    connection,
    ...(typeof likings === "string" ? { likings } : {}),
    ...(normalizedBirthday ? { birthday: normalizedBirthday } : {}),
    ...(normalizedSpecialDates ? { specialDates: normalizedSpecialDates } : {}),
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

const Members = () => {
  const [members, setMembers] = useState<Member[]>(loadMembersFromStorage);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

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
    console.log("Edit member:", member);
  };

  const handleAddMember = useCallback(
    (data: AddMemberFormValues) => {
      setMembers((prev) => [
        ...prev,
        {
          id: nextMemberId,
          ...data,
        },
      ]);
      setIsAddMemberOpen(false);
    },
    [nextMemberId]
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <AnimatedList<Member>
          items={members}
          getItemKey={(member) => member.id}
          renderItem={(member, _index, isSelected) => (
            <MemberCard
              {...member}
              className={`${
                isSelected
                  ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/20"
                  : ""
              }`}
              onDelete={() => handleDeleteMember(member.id)}
              onEdit={() => handleEditMember(member)}
            />
          )}
          onItemSelect={(member) => {
            console.log("Selected member:", member);
          }}
          className="w-full"
          scrollContainerClassName="min-h-[22rem] max-h-[68vh] sm:max-h-[72vh] lg:max-h-[78vh] 2xl:max-h-[82vh]"
        />
        <button
          onClick={() => {
            setIsAddMemberOpen(true);
          }}
          className="m-3 rounded-xl border-2 border-green-400 bg-green-300 p-3 text-center font-bold dark:border-green-600 dark:bg-green-900"
        >
          Add Member
        </button>
      </div>
      <AddMemberPanel
        open={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSubmit={handleAddMember}
      />
    </>
  );
};

export default Members;
