declare module "streamifier" {
    import { Readable } from "stream";

    export function createReadStream(buffer: Buffer | Uint8Array | string): Readable;

    const streamifier: {
        createReadStream: typeof createReadStream;
    };

    export default streamifier;
}