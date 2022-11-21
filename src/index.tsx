import { ActionPanel, Action, List, Icon, open, getPreferenceValues } from "@raycast/api";
import { useExec } from "@raycast/utils";
import { useState } from "react";

interface Preferences {
  soulverPath?: string;
}

export default function Command() {
  const [savedLines, setSavedLines] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const preferences = getPreferenceValues<Preferences>();
  const soulverPath = preferences.soulverPath || "/Applications/Soulver 3.app";
  const query = [...savedLines, searchText].join("\n");
  const { data, isLoading } = useExec(`${soulverPath}/Contents/MacOS/CLI/soulver`, [query], {
    keepPreviousData: true,
    initialData: "",
  });
  const lines = data.split("\n");
  const lastLine = (lines.length === savedLines.length ? undefined : lines.pop()) || "";
  const common = (
    <ActionPanel.Section>
      <Action
        title="Open in Soulver"
        icon={Icon.ArrowNe}
        onAction={async () => {
          await open(`x-soulver://x-callback-url/create?expression=${encodeURIComponent(query)}`);
        }}
      />
      <Action
        title="Clear All"
        icon={Icon.XMarkCircle}
        onAction={() => {
          setSavedLines([]);
          setSearchText("");
        }}
      />
    </ActionPanel.Section>
  );
  return (
    <List
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Enter Query"
    >
      {
        <List.Item
          title={lastLine}
          subtitle={lastLine.length ? searchText : "..."}
          icon={Icon.Calculator}
          actions={
            <ActionPanel>
              {lastLine.length !== 0 && (
                <ActionPanel.Section>
                  <Action.CopyToClipboard content={lastLine} />
                  <Action
                    title="Save"
                    icon={Icon.SaveDocument}
                    onAction={() => {
                      setSavedLines([...savedLines, searchText]);
                      setSearchText("");
                    }}
                  />
                </ActionPanel.Section>
              )}
              {common}
            </ActionPanel>
          }
        />
      }
      {lines
        .map((line, idx) => {
          return (
            <List.Item
              title={line}
              icon={Icon.Clock}
              subtitle={savedLines[idx]}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action.CopyToClipboard content={line} />
                  </ActionPanel.Section>
                  {common}
                </ActionPanel>
              }
              key={idx}
            />
          );
        })
        .reverse()}
    </List>
  );
}
