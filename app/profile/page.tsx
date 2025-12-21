"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SpotifyUser = {
	display_name?: string;
	images?: { url: string }[];
	followers?: { total?: number };
	id?: string;
	email?: string;
};

type PlaylistItem = {
	id: string;
	name: string;
	images?: { url: string }[];
	tracks?: { total?: number };
	owner?: { display_name?: string };
};

export default function ProfilePage() {
	const [user, setUser] = useState<SpotifyUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [playlists, setPlaylists] = useState<PlaylistItem[] | null>(null);
	const [loadingPlaylists, setLoadingPlaylists] = useState(true);
	const [playlistsError, setPlaylistsError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const res = await fetch("/api/me");
				if (!res.ok) {
					const text = await res.text();
					throw new Error(text || "Failed to fetch user");
				}
				const data = await res.json();
				if (mounted) setUser(data);
			} catch (err: any) {
				if (mounted) setError(err?.message || "Error fetching user");
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const res = await fetch("/api/me/playlists");
				if (!res.ok) {
					const text = await res.text();
					throw new Error(text || "Failed to fetch playlists");
				}
				const data = await res.json();
				if (mounted) setPlaylists(data.items ?? []);
			} catch (err: any) {
				if (mounted) setPlaylistsError(err?.message || "Error fetching playlists");
			} finally {
				if (mounted) setLoadingPlaylists(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div className="p-6">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-semibold mb-6">个人资料</h1>

				<div className="bg-white/5 rounded-lg p-6 flex items-center gap-6">
					<div className="w-28 h-28 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
						{loading ? (
							<div className="w-full h-full bg-white/10 animate-pulse" />
						) : user?.images && user.images[0] ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={user.images[0].url}
								alt={user.display_name || "avatar"}
								className="w-full h-full object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-sm text-white/60">
								无头像
							</div>
						)}
					</div>

					<div className="flex-1">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-xl font-bold">{user?.display_name ?? "未登录"}</div>
								<div className="text-sm text-white/70">{user?.email ?? "-"}</div>
								<div className="text-sm text-white/60 mt-1">关注者: {user?.followers?.total ?? 0}</div>
							</div>

							<div className="flex items-center gap-3">
								<a
									href="/api/auth/spotify/logout"
									className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-sm"
								>
									登出
								</a>
								<Link href="/profile/edit" className="px-3 py-1 rounded-md bg-white/5 text-sm">
									编辑资料
								</Link>
							</div>
						</div>

						<div className="mt-4">
							<h2 className="text-lg font-medium mb-2">我的歌单</h2>
							{loadingPlaylists ? (
								<div className="text-sm text-white/60">加载歌单…</div>
							) : playlistsError ? (
								<div className="text-sm text-red-400">加载歌单出错: {playlistsError}</div>
							) : !playlists || playlists.length === 0 ? (
								<div className="text-sm text-white/60">未找到歌单</div>
							) : (
								<div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
									{playlists.map((pl) => (
										<Link
											key={pl.id}
											href={`/playlists/${pl.id}`}
											className="bg-white/3 p-3 rounded-lg flex items-center gap-3 hover:scale-[1.01] transition"
										>
											<div className="w-16 h-16 bg-white/5 rounded overflow-hidden flex-shrink-0">
												{pl.images && pl.images[0] ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img src={pl.images[0].url} alt={pl.name} className="w-full h-full object-cover" />
												) : (
													<div className="w-full h-full flex items-center justify-center text-xs text-white/60">暂无封面</div>
												)}
											</div>

											<div className="flex-1">
												<div className="font-medium truncate">{pl.name}</div>
												<div className="text-sm text-white/60">{pl.tracks?.total ?? 0} 首 · {pl.owner?.display_name ?? "-"}</div>
											</div>
										</Link>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

