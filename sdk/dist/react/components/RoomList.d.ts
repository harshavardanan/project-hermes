import React from "react";
import type { Room } from "../../types/index";
interface RoomListProps {
    rooms: Room[];
    activeRoomId?: string | null;
    currentUserId: string;
    loading?: boolean;
    onSelectRoom: (room: Room) => void;
    onCreateDirect?: () => void;
    onCreateGroup?: () => void;
    renderRoomItem?: (room: Room, isActive: boolean) => React.ReactNode;
    renderAvatar?: (room: Room) => React.ReactNode;
    renderEmpty?: () => React.ReactNode;
    className?: string;
    itemClassName?: string;
}
export declare const RoomList: React.FC<RoomListProps>;
export {};
//# sourceMappingURL=RoomList.d.ts.map