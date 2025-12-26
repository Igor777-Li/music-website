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
	const [createdPlaylists, setCreatedPlaylists] = useState<PlaylistItem[] | null>(null);
	const [loadingCreated, setLoadingCreated] = useState(true);
	const [createdError, setCreatedError] = useState<string | null>(null);

	const [likedPlaylists, setLikedPlaylists] = useState<PlaylistItem[] | null>(null);
	const [loadingLiked, setLoadingLiked] = useState(true);
	const [likedError, setLikedError] = useState<string | null>(null);

	/*
		Use external backend (same as login/register) to fetch user info.
		The second effect below will call `${baseUrl}/user` using the token
		stored in cookie; remove the separate /api/auth/spotify/me fetch.
	*/

	/* ---------- fetch from backend DB (same server used by login) ---------- */
	useEffect(() => {
		let mounted = true;
		const baseUrl = "http://8.134.159.152:3355";

		function getToken(): string | null {
			const m = document.cookie
				.split('; ')
				.find((r) => r.startsWith('spotify_access_token='));
			return m ? m.split('=')[1] : null;
		}

		(async () => {
			try {
				if (mounted) setLoading(true);
				const token = getToken();
				if (!token) throw new Error('Not logged in');

				// user info: try several possible backend endpoints until one succeeds
				try {
					const userPaths = ['/user', '/me', '/profile', '/user/info', '/userinfo'];
					let gotUser = false;
					for (const p of userPaths) {
						try {
							const res = await fetch(`${baseUrl}${p}`, {
								headers: { Authorization: `Bearer ${token}` },
								cache: 'no-store',
							});
							if (!res.ok) continue;
							const data = await res.json();
							const u = data.user ?? data;
							if (mounted) {
								setUser({
									display_name: u.username ?? u.display_name,
									images: u.avatarUrl ? [{ url: u.avatarUrl }] : undefined,
									followers: { total: u.followers ?? u.followers_count ?? 0 },
									id: u.id,
									email: u.email,
								});
							}
							gotUser = true;
							break;
						} catch (err) {
							continue;
						}
					}
					if (!gotUser) {
						// no user endpoint found or unauthorized; leave user null
					}
				} catch (e) {
					// ignore
				}

				// created playlists (server uses /playlist to list user's created playlists)
				try {
					const res = await fetch(`${baseUrl}/playlist`, {
						headers: { Authorization: `Bearer ${token}` },
						cache: 'no-store',
					});
					if (!res.ok) {
						const txt = await res.text();
						throw new Error(txt || 'Failed to fetch created playlists');
					}
					const data = await res.json();
					const list = data.list ?? data.playlists ?? data.items ?? data;
					if (mounted) {
						setCreatedPlaylists(Array.isArray(list) ? list : []);
						// If backend doesn't expose a user endpoint, try to derive a display name from playlist owner
						if (!user && Array.isArray(list) && list.length > 0) {
							const ownerName = list[0]?.owner?.display_name ?? list[0]?.owner?.name ?? null;
							if (ownerName) {
								setUser((prev) => ({ ...(prev ?? {}), display_name: ownerName }));
							}
						}
					}
				} catch (err: any) {
					if (mounted) setCreatedError(err?.message || 'Error fetching created playlists');
				} finally {
					if (mounted) setLoadingCreated(false);
				}

				// derive liked playlists from the returned playlist list if backend doesn't provide a separate endpoint.
				try {
					// If `list` variable exists from created playlists fetch above, use it. Otherwise use createdPlaylists state.
					let sourceList: any[] | null = null;
					// try to reuse local `list` variable if present in this scope (not accessible), so rely on state
					if (Array.isArray(createdPlaylists) && createdPlaylists.length > 0) {
						sourceList = createdPlaylists;
					}
					// find playlist named like 'Liked Songs' as the app uses that convention
					if (sourceList) {
						const liked = sourceList.filter((pl) => (pl.name || '').toLowerCase().includes('liked') || (pl.name === 'Liked Songs'));
						if (mounted) setLikedPlaylists(liked.length ? liked : []);
					} else {
						if (mounted) setLikedPlaylists([]);
					}
				} catch (err: any) {
					if (mounted) setLikedError(err?.message || 'Error deriving liked playlists');
				} finally {
					if (mounted) setLoadingLiked(false);
				}
			} catch (e) {
				if (mounted) setError((e as any)?.message || 'Not logged in');
				if (mounted) {
					setLoadingCreated(false);
					setLoadingLiked(false);
				}
			} finally {
				if (mounted) setLoading(false);
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

				{error && (
					<div className="text-sm text-red-400 mb-4">{error}</div>
				)}

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
							<h2 className="text-lg font-medium mb-2">创建的歌单</h2>
							{loadingCreated ? (
								<div className="text-sm text-white/60">加载歌单…</div>
							) : createdError ? (
								<div className="text-sm text-red-400">加载歌单出错: {createdError}</div>
							) : !createdPlaylists || createdPlaylists.length === 0 ? (
								<div className="text-sm text-white/60">未找到歌单</div>
							) : (
								<div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
									{createdPlaylists.map((pl, i) => (
										<Link
											key={pl.id ?? pl.name ?? i}
											href={`/playlists/${encodeURIComponent(pl.id ?? pl.name ?? String(i))}`}
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

							<h2 className="text-lg font-medium mb-2 mt-6">喜爱的歌单</h2>
							{loadingLiked ? (
								<div className="text-sm text-white/60">加载喜欢的歌单…</div>
							) : likedError ? (
								<div className="text-sm text-red-400">加载喜欢的歌单出错: {likedError}</div>
							) : !likedPlaylists || likedPlaylists.length === 0 ? (
								<div className="text-sm text-white/60">暂无喜欢的歌单</div>
							) : (
								<div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
									{likedPlaylists.map((pl, i) => (
										<Link
											key={pl.id ?? pl.name ?? i}
											href={`/playlists/${encodeURIComponent(pl.id ?? pl.name ?? String(i))}`}
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

