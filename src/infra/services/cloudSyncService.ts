import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Word } from "../../domain/entities";
import { WordRepository } from "../../domain/repositories";
import {
  CLOUDFLARE_R2_ENDPOINT,
  CLOUDFLARE_R2_BUCKET,
  S3_CLIENT_ACCESS_KEY,
  S3_CLIENT_SECRET_ACCESS_KEY,
} from "../../../env";

/**
 * Simple cloud sync service using Cloudflare R2.
 * Stores all words from the repository as a JSON file in the configured bucket.
 */
export class CloudSyncService {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = CLOUDFLARE_R2_BUCKET;
    this.s3 = new S3Client({
      region: "auto",
      endpoint: CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: S3_CLIENT_ACCESS_KEY,
        secretAccessKey: S3_CLIENT_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }

  /** Upload all words in the repository to R2 */
  async backupWords(repo: WordRepository, key = "words.json"): Promise<void> {
    const words = await repo.listAll();
    const body = JSON.stringify(words, null, 2);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: "application/json",
    });
    await this.s3.send(command);
  }

  /** Download words from R2 and replace local repository */
  async restoreWords(repo: WordRepository, key = "words.json"): Promise<void> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const data = await this.s3.send(command);
    if (!data.Body) return;
    const text = await (data.Body as any).transformToString();
    const words: Word[] = JSON.parse(text);
    if (repo.clearAllWords) {
      await repo.clearAllWords();
    }
    for (const word of words) {
      await repo.save(word);
    }
  }
}
