import { expect, test } from "vitest";
import { createMariaDbConnectionUrl } from "@/lib/db/mariadb-connection-url";

test("habilita a recuperação da chave RSA somente em conexões locais", () => {
  const local = new URL(
    createMariaDbConnectionUrl(
      "mysql://app:secret@127.0.0.1:3306/controle_financeiro",
    ),
  );
  const remote = new URL(
    createMariaDbConnectionUrl(
      "mysql://app:secret@database.example/controle_financeiro",
    ),
  );

  expect(local.searchParams.get("timezone")).toBe("+00:00");
  expect(local.searchParams.get("allowPublicKeyRetrieval")).toBe("true");
  expect(remote.searchParams.get("timezone")).toBe("+00:00");
  expect(remote.searchParams.has("allowPublicKeyRetrieval")).toBe(false);
});
