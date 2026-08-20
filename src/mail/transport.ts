import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { environment } from "@/src/config/environment";

type Mail = { to: string; subject: string; text: string };

export async function sendMail(mail: Mail) {
  const env = environment();
  if (env.MAIL_TRANSPORT === "smtp") {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
    });
    await transporter.sendMail({ from: env.MAIL_FROM, ...mail });
    return { transport: "smtp" as const };
  }

  const directory = resolve(env.MAIL_FILE_DIR);
  await mkdir(directory, { recursive: true });
  const id = `${new Date().toISOString().replaceAll(":", "-")}-${randomUUID()}`;
  await writeFile(
    resolve(directory, `${id}.json`),
    JSON.stringify({ id, from: env.MAIL_FROM, createdAt: new Date().toISOString(), ...mail }, null, 2),
    { encoding: "utf8", flag: "wx" },
  );
  return { transport: "file" as const };
}
