import PlaylistView from "./PlaylistView";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  return <PlaylistView playlistName={decodeURIComponent(name)} />;
}
