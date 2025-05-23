import path from "path";

// minio配置文件
export default {
    endpoint: process.env.MINIO_ENDPOINT || "127.0.0.1",
    port: Number(process.env.MINIO_PORT) || undefined,
    accessKey: process.env.MINIO_ACCESS_KEY || "",
    secretKey: process.env.MINIO_SECRET_KEY || "",
    bucketName: process.env.MINIO_BUCKET_NAME || "bookroom",
    region: process.env.MINIO_REGION || "‌ap-southeast-1‌",
    useSSL: process.env.MINIO_USE_SSL === "true" || false,
};

export const SERVER_UPLOAD_PATH = path.join(
    process.env.SERVER_UPLOAD_PATH || __dirname,
    process.env.SERVER_UPLOAD_PATH ? "/" : "../../uploads"
);