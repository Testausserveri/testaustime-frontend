"use client";

import { Button, Table } from "@mantine/core";
import { prettyDuration } from "../../utils/dateUtils";
import { useModals } from "@mantine/modals";
import { Dashboard } from "../Dashboard";
import { showNotification } from "@mantine/notifications";
import styles from "./FriendList.module.css";
import axios from "../../axios";
import { useRouter } from "next/navigation";
import {
  ActivityDataEntry,
  ApiUsersUserActivityDataResponseItem,
} from "../../types";
import { useEffect, useState } from "react";
import { startOfDay } from "date-fns";
import { normalizeProgrammingLanguageName } from "../../utils/programmingLanguagesUtils";
import { useTranslation } from "react-i18next";

export interface ApiFriendsResponseItem {
  username: string;
  coding_time: {
    all_time: number;
    past_month: number;
    past_week: number;
  };
}

export type FriendListProps = {
  friends: ApiFriendsResponseItem[];
  ownTimeCoded?: number;
  username: string;
  locale: string;
};

const FriendDashboardModal = ({
  username,
  locale,
}: {
  username: string;
  locale: string;
}) => {
  const [allEntries, setAllEntries] = useState<ActivityDataEntry[]>();

  useEffect(() => {
    axios
      .get<ApiUsersUserActivityDataResponseItem[]>(
        `/users/${username}/activity/data`,
      )
      .then((response) => {
        const mappedData: ActivityDataEntry[] = response.data.map((e) => ({
          ...e,
          start_time: new Date(e.start_time),
          dayStart: startOfDay(new Date(e.start_time)),
          language: normalizeProgrammingLanguageName(e.language),
        }));

        setAllEntries(mappedData);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [username]);

  if (!allEntries) {
    return null;
  }

  return (
    <Dashboard
      allEntries={allEntries}
      username={username}
      isFrontPage={false}
      locale={locale}
    />
  );
};

export const FriendList = ({
  friends,
  ownTimeCoded,
  username,
  locale,
}: FriendListProps) => {
  const { t } = useTranslation();
  const modals = useModals();
  const router = useRouter();

  const unFriend = async (username: string) => {
    await axios.delete("/friends/remove", {
      data: username,
      headers: { "Content-Type": "text/plain" },
    });
    return username;
  };

  const friendsSorted = [
    ...friends
      .map((f) => ({ ...f, isMe: false }))
      .concat({
        coding_time: {
          all_time: 0,
          past_month: ownTimeCoded ?? 0,
          past_week: 0,
        },
        isMe: true,
        username,
      }),
  ].sort((a, b) => b.coding_time.past_month - a.coding_time.past_month);

  const openFriendDashboard = (friendUsername: string) => {
    modals.openModal({
      title: t("friends.friendDashboardTitle", {
        username: friendUsername,
      }),
      size: "calc(800px + 10%)",
      children: (
        <FriendDashboardModal username={friendUsername} locale={locale} />
      ),
      styles: {
        title: {
          fontSize: "2rem",
          marginBlock: "0.5rem",
          fontWeight: "bold",
        },
      },
    });
  };

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{t("friends.index")}</Table.Th>
          <Table.Th>{t("friends.friendName")}</Table.Th>
          <Table.Th>{t("friends.timeCoded", { days: 30 })}</Table.Th>
          <Table.Th />
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {friendsSorted.map(
          ({ username, coding_time: { past_month }, isMe }, idx) => (
            <Table.Tr
              key={username}
              className={isMe ? styles.tableRow : undefined}
            >
              <Table.Td>{idx + 1}</Table.Td>
              <Table.Td>{username}</Table.Td>
              <Table.Td>{prettyDuration(past_month)}</Table.Td>
              <Table.Td style={{ textAlign: "right", padding: "7px 0px" }}>
                {!isMe && (
                  <Button
                    variant="filled"
                    color="blue"
                    size="compact-md"
                    onClick={() => {
                      openFriendDashboard(username);
                    }}
                  >
                    {t("friends.showDashboard")}
                  </Button>
                )}
              </Table.Td>
              <Table.Td style={{ textAlign: "right", padding: "7px 0px" }}>
                {!isMe && (
                  <Button
                    variant="outline"
                    color="red"
                    size="compact-md"
                    onClick={() => {
                      unFriend(username)
                        .then(() => {
                          router.refresh();
                        })
                        .catch(() => {
                          showNotification({
                            title: t("error"),
                            color: "red",
                            message: t("friends.errorRemovingFriend"),
                          });
                        });
                    }}
                  >
                    {t("friends.unfriend")}
                  </Button>
                )}
              </Table.Td>
            </Table.Tr>
          ),
        )}
      </Table.Tbody>
    </Table>
  );
};
