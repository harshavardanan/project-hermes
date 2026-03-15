import type { HermesClient } from "../core/HermesClient";
import type { Room, CreateDirectRoomInput, CreateGroupRoomInput } from "../types/index";
export declare class Rooms {
    private client;
    constructor(client: HermesClient);
    list(): Promise<Room[]>;
    createDirect(input: CreateDirectRoomInput): Promise<Room>;
    createGroup(input: CreateGroupRoomInput): Promise<Room>;
    delete(roomId: string): Promise<void>;
    addMember(roomId: string, userId: string): Promise<void>;
    removeMember(roomId: string, userId: string): Promise<void>;
    onCreated(callback: (room: Room) => void): () => void;
    onDeleted(callback: (data: {
        roomId: string;
    }) => void): () => void;
    onMemberJoined(callback: (data: {
        roomId: string;
        userId: string;
    }) => void): () => void;
    onMemberLeft(callback: (data: {
        roomId: string;
        userId: string;
    }) => void): () => void;
}
//# sourceMappingURL=rooms.d.ts.map