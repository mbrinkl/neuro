import { useClipboard } from "@mantine/hooks";

export const CopyGameLink = () => {
  const clipboard = useClipboard();

  const onCopyClick = () => {
    clipboard.copy(window.location.href);
  };

  return (
    <div>
      <button onClick={onCopyClick}>Copy</button>
    </div>
  );
};
