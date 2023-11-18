"use client";

import { Button, Table } from "@mantine/core";
import { prettyDuration } from "../../utils/dateUtils";
import { useModals } from "@mantine/modals";
import { Dashboard } from "../Dashboard";
import { showNotification } from "@mantine/notifications";
import styles from "./FriendList.module.css";
import {
  ActivityDataEntry,
  ApiUsersUserActivityDataResponseItem,
} from "../../types";
import { useEffect, useState } from "react";
import { startOfDay } from "date-fns";
import { normalizeProgrammingLanguageName } from "../../utils/programmingLanguagesUtils";
import { useTranslation } from "react-i18next";
import { ApiFriendsResponseItem } from "../../api/friendsApi";
import { removeFriend } from "./actions";

type FriendListProps = {
  friends: ApiFriendsResponseItem[];
  ownTimeCoded: number;
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
    void (async () => {
      const response = await fetch(`/api/users/${username}/activity/data`);

      if (!response.ok) {
        showNotification({
          title: "Error",
          message: "There was an error fetching the data",
          color: "red",
        });
        return;
      }

      const data =
        (await response.json()) as ApiUsersUserActivityDataResponseItem[];
      const mappedData: ActivityDataEntry[] = data.map((e) => ({
        ...e,
        start_time: new Date(e.start_time),
        dayStart: startOfDay(new Date(e.start_time)),
        language: normalizeProgrammingLanguageName(e.language),
      }));
      setAllEntries(mappedData);
    })();
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

  const friendsSorted = [
    ...friends
      .map((f) => ({
        isMe: false,
        codingTime: f.coding_time.past_month,
        username: f.username,
      }))
      .concat({
        codingTime: ownTimeCoded,
        isMe: true,
        username,
      }),
  ].sort((a, b) => b.codingTime - a.codingTime);

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
        {friendsSorted.map(({ username, codingTime, isMe }, idx) => (
          <Table.Tr
            key={username}
            className={isMe ? styles.tableRow : undefined}
          >
            <Table.Td>{idx + 1}</Table.Td>
            <Table.Td>{username}</Table.Td>
            <Table.Td>{prettyDuration(codingTime)}</Table.Td>
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
                    removeFriend(username)
                      .then((result) => {
                        if (result) {
                          showNotification({
                            title: t("error"),
                            color: "red",
                            message: t("friends.errorRemovingFriend"),
                          });
                        }
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
        ))}
      </Table.Tbody>
    </Table>
  );
};
