import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  Anchor,
  Center,
  createStyles,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { GitHubLogoIcon, QuestionMarkIcon } from "@radix-ui/react-icons";
import React, { ReactNode } from "react";
import Neovim from "../../../public/images/neovim.svg";
import Vscode from "../../../public/images/vscode.svg";
import IntelliJ from "../../../public/images/intellij.svg";
import Micro from "../../../public/images/micro.svg";
import Sublime from "../../../public/images/sublime.svg";
import { useTranslation } from "next-i18next";
import styles from "./index.module.css";

interface ExtensionBlockProps {
  logo: React.ReactNode;
  downloadLink: string;
  sourceCodeLink: string;
  text: string;
}

const useStyles = createStyles((theme) => ({
  wrapper: {
    backgroundColor: theme.colorScheme === "dark" ? "#282a36" : "#fff",
    borderRadius: "10px",
    border: `1px solid ${theme.colorScheme === "dark" ? "#222" : "#ccc"}`,
  },
  iconContainer: {
    backgroundColor: theme.colorScheme === "dark" ? "#22242e" : "#eef1ff",
    padding: "calc(2rem + 2px)",
    "&:hover": {
      filter: "brightness(0.95)",
    },
    borderRadius: "0px 10px 10px 0px",
    "@media (max-width: 685px)": {
      width: "100%",
      height: "50px",
      padding: "unset",
      display: "flex",
      alignContent: "center",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: "0px 0px 10px 10px",
    },
  },
}));

export const ExtensionBlock = ({
  logo,
  downloadLink,
  sourceCodeLink,
  text,
}: ExtensionBlockProps) => {
  const { classes } = useStyles();

  // Icon map for source code icons
  const iconMap: Record<string, ReactNode> = {
    // Root domain in lower case to icon element
    github: <GitHubLogoIcon height={20} width={20} className={styles.icon} />,
  };

  return (
    <Group sx={{ width: "100%" }} className={classes.wrapper}>
      <Center className={styles.logo}>{logo}</Center>
      <Anchor className={styles.spacer} />
      <Anchor
        href={downloadLink}
        sx={{ flex: 1 }}
        size="lg"
        className={styles.text}
      >
        {text}
      </Anchor>
      <Group spacing={10} className={styles.sideContainer}>
        <Anchor
          href={sourceCodeLink}
          variant="text"
          className={classes.iconContainer}
        >
          {iconMap[
            new URL(sourceCodeLink).hostname.split(".").reverse()[1]
          ] ?? (
            <QuestionMarkIcon height={20} width={20} className={styles.icon} />
          )}
        </Anchor>
      </Group>
    </Group>
  );
};

const ExtensionsPage = () => {
  const { t } = useTranslation();

  return (
    <div style={{ height: "calc(100% - 36px - 50px - 80px)" }}>
      <Title order={1} mb={5}>
        {t("extensions.title")}
      </Title>
      <Text>{t("extensions.body")}</Text>
      <Stack spacing={25} mt={30}>
        <ExtensionBlock
          logo={<Vscode width={40} height={40} />}
          downloadLink="https://marketplace.visualstudio.com/items?itemName=testausserveri-ry.testaustime"
          sourceCodeLink="https://github.com/Testausserveri/testaustime-vscode"
          text={t("extensions.vscode")}
        />
        <ExtensionBlock
          logo={<Neovim width={40} height={40} />}
          downloadLink="https://github.com/Testaustime/testaustime.nvim"
          sourceCodeLink="https://github.com/Testaustime/testaustime.nvim"
          text={t("extensions.neovim")}
        />
        <ExtensionBlock
          logo={<IntelliJ width={40} height={40} />}
          downloadLink="https://plugins.jetbrains.com/plugin/19408-testaustime/"
          sourceCodeLink="https://github.com/Testaustime/testaustime-intellij/"
          text={t("extensions.intellij")}
        />
        <ExtensionBlock
          logo={<Micro width={40} height={40} />}
          downloadLink="https://github.com/Testaustime/testaustime-micro"
          sourceCodeLink="https://github.com/Testaustime/testaustime-micro"
          text={t("extensions.micro")}
        />
        <ExtensionBlock
          logo={<Sublime width={40} height={40} />}
          downloadLink="https://github.com/Testaustime/testaustime-sublime/releases/latest"
          sourceCodeLink="https://github.com/Testaustime/testaustime-sublime"
          text={t("extensions.sublime")}
        />
      </Stack>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: await serverSideTranslations(locale ?? "en"),
});

export default ExtensionsPage;
