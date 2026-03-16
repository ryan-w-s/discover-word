PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Discovery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "term" TEXT NOT NULL,
    "discoveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL
);

INSERT INTO "new_Discovery" ("id", "term", "discoveredAt", "source")
SELECT "id", "term", "discoveredAt", "source"
FROM "Discovery";

DROP TABLE "Discovery";
ALTER TABLE "new_Discovery" RENAME TO "Discovery";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
