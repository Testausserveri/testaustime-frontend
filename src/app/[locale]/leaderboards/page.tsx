import { Group, Title } from "@mantine/core";
import { LeaderboardsList } from "../../../components/leaderboard/LeaderboardsList";
import { LeaderboardData } from "../../../types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import initTranslations from "../../i18n";
import { CreateNewLeaderboardButton } from "./CreateNewLeaderboardButton";
import { JoinLeaderboardButton } from "./JoinLeaderboardButton";
import { getLeaderboard, getMyLeaderboards } from "../../../api/leaderboardApi";
import { getMe } from "../../../api/usersApi";

export type LeaderboardsPageProps = {
  initialLeaderboards: LeaderboardData[];
  username: string;
  locale: string;
};

export default async function LeaderboardsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const token = cookies().get("token")?.value;
  if (!token) {
    redirect("/login");
  }

  const leaderboardList = await getMyLeaderboards(token);

  const leaderboardPromises = leaderboardList.map((leaderboard) =>
    getLeaderboard(leaderboard.name, token),
  );

  const leaderboards = await Promise.all(leaderboardPromises);

  const me = await getMe(token);

  if ("error" in me) {
    if (me.error === "Unauthorized") {
      cookies().delete("token");
      redirect("/login");
    } else {
      throw new Error(me.error);
    }
  }

  const { t } = await initTranslations(locale, ["common"]);

  return (
    <>
      <div>
        <Group align="center" mb="md" mt="xl" justify="space-between">
          <Title>{t("leaderboards.leaderboards")}</Title>
          <Group gap="sm">
            <CreateNewLeaderboardButton
              texts={{
                button: t("leaderboards.createNewLeaderboard"),
                createNewLeaderboardTitle: t(
                  "leaderboards.createNewLeaderboard",
                ),
                modal: {
                  error: t("error"),
                  leaderboardExists: t("leaderboards.leaderboardExists"),
                  leaderboardCreateError: t(
                    "leaderboards.leaderboardCreateError",
                  ),
                  validation: {
                    required: t("leaderboards.validation.required"),
                    min: t("leaderboards.validation.min", { min: 2 }),
                    max: t("leaderboards.validation.max", { max: 32 }),
                    regex: t("leaderboards.validation.regex"),
                  },
                  create: t("leaderboards.create"),
                },
              }}
            />
            <JoinLeaderboardButton
              texts={{
                title: t("leaderboards.joinLeaderboard"),
                button: t("leaderboards.joinLeaderboard"),
              }}
            />
          </Group>
        </Group>
        <LeaderboardsList leaderboards={leaderboards} username={me.username} />
      </div>
    </>
  );
}
