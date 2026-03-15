import type { HermesClient } from "../../core/HermesClient";
import type { UploadResult, Message } from "../../types/index";
export declare const useUpload: (client: HermesClient) => {
    upload: (file: File) => Promise<UploadResult | null>;
    sendFile: (roomId: string, file: File, replyTo?: string) => Promise<Message | null>;
    validate: (file: File, maxMb?: number) => string | null;
    uploading: boolean;
    error: string | null;
    lastUpload: UploadResult | null;
};
//# sourceMappingURL=useUpload.d.ts.map