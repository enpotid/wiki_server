-- CreateTable
CREATE TABLE "doc" (
    "title" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "lastrev" INTEGER NOT NULL DEFAULT 0,
    "acl" JSON NOT NULL DEFAULT '{}',
    "uuid" UUID NOT NULL,
    "links" TEXT NOT NULL,

    CONSTRAINT "uuid" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "groups" (
    "name" TEXT NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "history" (
    "namespace" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rev" INTEGER NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL,
    "body" TEXT,
    "log" TEXT,
    "modifiedtime" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT NOT NULL,
    "uuid" UUID NOT NULL,

    CONSTRAINT "history_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "log" (
    "who" TEXT NOT NULL,
    "time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "log" JSON NOT NULL,

    CONSTRAINT "log_pkey" PRIMARY KEY ("time")
);

-- CreateTable
CREATE TABLE "namespace" (
    "name" TEXT NOT NULL,
    "defaultacl" JSON DEFAULT '{}',

    CONSTRAINT "namespace_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "talk" (
    "talkid" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "body" TEXT,
    "author" TEXT NOT NULL,
    "uuid" UUID NOT NULL,

    CONSTRAINT "talk_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "talks" (
    "namespace" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "talktitle" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "talks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdtime" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "user_group" JSON DEFAULT '[{"name":"user", "expire":"none"}]',
    "permission" JSON DEFAULT '[""]',
    "setting" JSON DEFAULT '{}',

    CONSTRAINT "users_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "backlink" (
    "uuid" UUID NOT NULL,
    "namespace" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "links" TEXT NOT NULL,

    CONSTRAINT "backlink_pkey" PRIMARY KEY ("uuid")
);
