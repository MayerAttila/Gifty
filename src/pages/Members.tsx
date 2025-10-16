import { useCallback, useMemo, useState } from "react";
import AnimatedList from "../components/ui/AnimatedList";
import MemberCard, { type Member } from "../components/ui/MemberCard";
import AddMemberPanel, {
  type AddMemberFormValues,
} from "../components/ui/AddMemberPanel";

const dummieMembers: Member[] = [
  {
    id: 1,
    name: "John Doe",
    gender: "Male",
    age: 30,
    birthday: "1993-01-15",
    memberType: "friend",
    relationship: "College roommate",
    connectedSince: "2011-09-01",
    preferences: "Single-origin coffee, weekend hikes",
  },
  {
    id: 2,
    name: "Jane Smith",
    gender: "Female",
    age: 25,
    birthday: "1998-05-22",
    memberType: "family",
    relationship: "Younger sister",
    connectedSince: "1998-05-22",
    preferences: "Art museum passes, cozy sweaters",
  },
  {
    id: 3,
    name: "Alice Johnson",
    gender: "Female",
    age: 28,
    birthday: "1995-03-10",
    memberType: "coworker",
    relationship: "Design partner",
    connectedSince: "2020-02-01",
    preferences: "Stationery sets, matcha treats",
  },
  {
    id: 4,
    name: "Bob Brown",
    gender: "Male",
    age: 35,
    birthday: "1988-07-30",
    memberType: "family",
    relationship: "Older cousin",
    connectedSince: "1988-07-30",
    preferences: "BBQ gadgets, vinyl records",
  },
  {
    id: 5,
    name: "Charlie Davis",
    gender: "Male",
    age: 32,
    birthday: "1991-11-12",
    memberType: "friend",
    relationship: "Running buddy",
    connectedSince: "2018-04-15",
    preferences: "Trail gear, smart home tech",
  },
  {
    id: 6,
    name: "Diana Evans",
    gender: "Female",
    age: 27,
    birthday: "1996-09-05",
    memberType: "other",
    relationship: "Neighbor",
    connectedSince: "2021-06-10",
    preferences: "Indoor plants, indie novels",
  },
  {
    id: 7,
    name: "Ethan Harris",
    gender: "Male",
    age: 29,
    birthday: "1994-12-20",
    memberType: "coworker",
    relationship: "Product manager",
    connectedSince: "2019-01-07",
    preferences: "Specialty teas, board games",
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
