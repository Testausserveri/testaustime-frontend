"use client";

import { Button, Divider, Menu } from "@mantine/core";
import { ExitIcon, GearIcon, MixIcon, PersonIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logOut } from "../utils/authUtils";
import { useTranslation } from "react-i18next";

export type NavigationMenuDropdownProps = {
  username: string | undefined;
  locale: string;
};

export const NavigationMenuDropdown = ({
  username,
  locale,
}: NavigationMenuDropdownProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  const logOutAndRedirect = async () => {
    await logOut();
    router.push("/");
  };

  return (
    <Menu trigger="hover">
      <Menu.Target>
        <Button
          variant="outline"
          size="xs"
          leftSection={<PersonIcon style={{ marginRight: "5px" }} />}
        >
          {username}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t("navbar.account")}</Menu.Label>
        <Menu.Item
          component={Link}
          href={`/${locale}/profile`}
          leftSection={<GearIcon />}
          prefetch={false}
        >
          {t("navbar.settings")}
        </Menu.Item>
        <Divider />
        <Menu.Item
          component={Link}
          href={`/${locale}/extensions`}
          leftSection={<MixIcon />}
          prefetch={false}
        >
          {t("navbar.extensions")}
        </Menu.Item>
        <Divider />
        <Menu.Item
          color="blue"
          leftSection={<ExitIcon />}
          onClick={() => {
            logOutAndRedirect().catch(console.error);
          }}
        >
          {t("navbar.logOut")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
