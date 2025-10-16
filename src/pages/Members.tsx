import React, { useCallback, useMemo, useState } from "react";
import AnimatedList from "../components/ui/AnimatedList";
import MemberCard, { type Member } from "../components/ui/MemberCard";
import AddMemberPanel, {
  type AddMemberFormValues,
} from "../components/ui/AddMemberPanel";

const dummieMembers = [
  { id: 1, name: "John Doe", gender: "Male", age: 30, birthday: "1993-01-15" },
  {
    id: 2,
    name: "Jane Smith",
    gender: "Female",
    age: 25,
    birthday: "1998-05-22",
  },
  {
    id: 3,
    name: "Alice Johnson",
    gender: "Female",
    age: 28,
    birthday: "1995-03-10",
  },
  {
    id: 4,
    name: "Bob Brown",
    gender: "Male",
    age: 35,
    birthday: "1988-07-30",
  },
  {
    id: 5,
    name: "Charlie Davis",
    gender: "Male",
    age: 32,
    birthday: "1991-11-12",
  },
  {
    id: 6,
    name: "Diana Evans",
    gender: "Female",
    age: 27,
    birthday: "1996-09-05",
  },
  {
    id: 7,
    name: "Ethan Harris",
    gender: "Male",
    age: 29,
    birthday: "1994-12-20",
  },
];

const Members = () => {
  const [members, setMembers] = useState<Member[]>(dummieMembers);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

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
      <div className="flex flex-col gap-6 ">
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
