import { createUploadthing, type FileRouter } from "uploadthing/express";
import { UploadThingError } from "uploadthing/server";
import { getSessionFromHeaders } from "../lib/session";
import { prisma } from "../db";

const f = createUploadthing();

export const uploadRouter = {
  profileImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await getSessionFromHeaders(req.headers);

      if (!session) {
        throw new UploadThingError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      return {
        userId: session.user.id,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const imageUrl = (file as any).ufsUrl || file.url;
      console.log("Uploaded image URL:", imageUrl);

      await prisma.user.update({
        where: { id: metadata.userId },
        data: { image: imageUrl },
      });

      return {
        url: imageUrl,
      };
    }),
  chatAttachment: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await getSessionFromHeaders(req.headers);

      if (!session) {
        throw new UploadThingError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      return {
        userId: session.user.id,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const imageUrl = (file as any).ufsUrl || file.url;
      return {
        url: imageUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
