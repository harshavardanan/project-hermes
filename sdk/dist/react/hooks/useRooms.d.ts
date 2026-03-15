import type { HermesClient } from "../../core/HermesClient";
import type { Room, CreateDirectRoomInput, CreateGroupRoomInput } from "../../types/index";
export declare const useRooms: (client: HermesClient) => {
    rooms: Room[];
    loading: boolean;
    error: string | null;
    createDirect: (input: CreateDirectRoomInput) => Promise<Room>;
    createGroup: (input: CreateGroupRoomInput) => Promise<Room>;
    deleteRoom: (roomId: string) => Promise<void>;
    addMember: (roomId: string, userId: string) => Promise<void>;
    removeMember: (roomId: string, userId: string) => Promise<void>;
    refetch: () => Promise<void>;
};
//# sourceMappingURL=useRooms.d.ts.map