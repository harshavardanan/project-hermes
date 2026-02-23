type Props = {
  users: string[];
  active: string | null;
  onSelect: (u: string) => void;
};

export default function UserList({ users, active, onSelect }: Props) {
  return (
    <div style={{ width: 200, borderRight: "1px solid #ccc" }}>
      {users.map((u) => (
        <div
          key={u}
          onClick={() => onSelect(u)}
          style={{
            padding: 10,
            cursor: "pointer",
            background: active === u ? "#eee" : "transparent",
          }}
        >
          {u}
        </div>
      ))}
    </div>
  );
}
