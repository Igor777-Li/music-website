"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlaylists } from "@/contexts/PlaylistContext";

/* ------------------ 通用钩子：拉用户列表 + 分页 + 关注 ------------------ */
type UserItem = {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isFollowing?: boolean; // discover 列表专用
};

type ApplicationItem = {
  id: number;
  uid: string;
  username: string;
  reason?: string;
  created: string;
  status: number; // 0: 待审核, 1: 通过, 2: 拒绝
};

function useUserList(apiKey: "followings" | "discover") {
  const [list, setList] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const LIMIT = 20;

  const getToken = () =>
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("spotify_access_token="))
      ?.split("=")[1];

  const fetchList = (p = 1) => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    fetch(`http://8.134.159.152:3355/${apiKey}?page=${p}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((res) => {
        // 对于关注列表，确保每个用户都有 isFollowing: true
        const processedList = (res.list ?? []).map((user: UserItem) => {
          if (apiKey === "followings") {
            return { ...user, isFollowing: true };
          }
          return user;
        });
        
        setList(processedList);
        setTotal(res.total ?? 0);
        setPage(p);
      })
      .catch((error) => {
        console.error(`Failed to fetch ${apiKey}:`, error);
      })
      .finally(() => setLoading(false));
  };

  /* 统一关注/取消关注 */
  const toggleFollow = (target: UserItem) => {
    const token = getToken();
    if (!token) return;
    const method = target.isFollowing ? "DELETE" : "POST";
    fetch("http://8.134.159.152:3355/follow", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetId: target.id }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to toggle follow");
        }
        // 局部刷新：仅翻转当前项
        setList((prev) =>
          prev.map((u) =>
            u.id === target.id ? { ...u, isFollowing: !u.isFollowing } : u
          )
        );
      })
      .catch((error) => {
        console.error("Failed to toggle follow:", error);
      });
  };

  return { list, total, page, loading, fetchList, toggleFollow };
}

/* ------------------ 头像组件 ------------------ */
function Avatar({ url, className = "" }: { url?: string; className?: string }) {
  return url ? (
    <img src={url} alt="" className={`${className} object-cover`} />
  ) : (
    <div
      className={`${className} flex items-center justify-center bg-white/10 text-white/60 text-xs`}
    >
      无头像
    </div>
  );
}

/* ------------------ 列表渲染 ------------------ */
function UserGrid({
  data,
  onToggle,
}: {
  data: UserItem[];
  onToggle: (u: UserItem) => void;
}) {
  if (!data.length) return <div className="text-sm text-white/60">暂无数据</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {data.map((u) => (
        <div
          key={u.id}
          className="bg-white/5 p-6 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-all duration-300"
        >
          <Avatar url={u.avatarUrl} className="w-16 h-16 rounded-full" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg truncate">{u.username}</div>
            <div className="text-sm text-white/60 mt-1 line-clamp-2 h-10">
              {u.bio || "暂无签名"}
            </div>
          </div>
          <button
            onClick={() => onToggle(u)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
              u.isFollowing
                ? "bg-white/20 text-white hover:bg-white/30"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {u.isFollowing ? "取消关注" : "关注"}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------ 主页面 ------------------ */
export default function ProfilePage() {
  const { playlists } = usePlaylists();
  const [user, setUser] = useState<{
    id?: string | number;
    username?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
    role?: number;
  } | null>(null);
  
  // 审核相关状态
  const [applyList, setApplyList] = useState<ApplicationItem[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  /* 关注 / 发现 两个数据源 */
  const followings = useUserList("followings");
  const discover = useUserList("discover");

  const [tab, setTab] = useState<"followings" | "discover">("followings");

  useEffect(() => {
    tab === "followings" ? followings.fetchList(1) : discover.fetchList(1);
  }, [tab]);

  /* 个人信息只拉一次 */
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("spotify_access_token="))
      ?.split("=")[1];
    if (!token) return;
    
    fetch("http://8.134.159.152:3355/user", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUser)
      .catch((error) => {
        console.error("Failed to fetch user info:", error);
        setUser(null);
      });
  }, []);

  /* 1. 拉待审核列表 */
  const fetchApplications = () => {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("spotify_access_token="))
      ?.split("=")[1];
    if (!token) return;
    
    setLoadingApplications(true);
    fetch("http://8.134.159.152:3355/applications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => setApplyList(res.list ?? []))
      .catch((error) => {
        console.error("Failed to fetch applications:", error);
      })
      .finally(() => setLoadingApplications(false));
  };

  /* 2. 审核操作 - 直接发送 status 数字 */
  const doAudit = (id: number, status: number) => {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("spotify_access_token="))
      ?.split("=")[1];
    if (!token) return;
    
    fetch(`http://8.134.159.152:3355/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to process audit");
        }
        // 刷新列表
        fetchApplications();
      })
      .catch((error) => {
        console.error("Failed to process audit:", error);
      });
  };

  /* 3. 仅管理员拉数据 */
  useEffect(() => {
    if (user && user.role === 1) {
      fetchApplications();
    }
  }, [user]);

  const created = playlists.filter((p) => p.name !== "Liked Songs");
  const liked = playlists.filter((p) => p.name === "Liked Songs");

  const Pagination = ({
    page,
    total,
    onChange,
  }: {
    page: number;
    total: number;
    onChange: (p: number) => void;
  }) => {
    const LIMIT = 20;
    if (total <= LIMIT) return null;
    const max = Math.ceil(total / LIMIT);
    return (
      <div className="mt-4 flex items-center justify-center gap-3 text-sm">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1 rounded bg-white/10 disabled:opacity-50 hover:bg-white/20 transition"
        >
          上一页
        </button>
        <span className="text-white/70">
          {page} / {max}
        </span>
        <button
          disabled={page >= max}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1 rounded bg-white/10 disabled:opacity-50 hover:bg-white/20 transition"
        >
          下一页
        </button>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">个人资料</h1>

        {/* 用户信息 */}
        <div className="bg-white/5 rounded-lg p-6 flex items-center gap-6">
          <Avatar url={user?.avatarUrl} className="w-28 h-28 rounded-full" />
          <div className="flex-1 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xl font-bold">{user?.username ?? "未登录"}</div>
              <div className="text-sm text-white/70">UID: {user?.id ?? "-"}</div>
              <div className="text-sm text-white/70">email: {user?.email ?? "未填写"}</div>
              <div className="text-sm text-white/60 mt-2">个性签名: {user?.bio || "暂无签名"}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Link
                href="/profile/edit"
                className="px-3 py-1 rounded-md bg-white/10 text-sm hover:bg-white/20 transition"
              >
                编辑资料
              </Link>
              <Link
                href="/profile/reset-password"
                className="px-3 py-1 rounded-md bg-white/10 text-sm hover:bg-white/20 transition"
              >
                修改密码
              </Link>
            </div>
          </div>
        </div>

        {/* 歌单区域 */}
        <PlaylistSection title="创建的歌单" list={created} />
        <PlaylistSection title="喜爱的歌单" list={liked} />

        {/* 关注模块 */}
        <div className="mt-8 bg-white/5 rounded-lg p-6">
          <div className="flex items-center gap-4 border-b border-white/10 pb-3 mb-4">
            <TabBtn
              active={tab === "followings"}
              onClick={() => setTab("followings")}
              text="关注列表"
            />
            <TabBtn
              active={tab === "discover"}
              onClick={() => setTab("discover")}
              text="去关注"
            />
          </div>

          {tab === "followings" && (
            <>
              {followings.loading && <div className="text-sm text-white/60">加载中…</div>}
              {!followings.loading && (
                <>
                  <UserGrid data={followings.list} onToggle={followings.toggleFollow} />
                  <Pagination
                    page={followings.page}
                    total={followings.total}
                    onChange={followings.fetchList}
                  />
                </>
              )}
            </>
          )}

          {tab === "discover" && (
            <>
              {discover.loading && <div className="text-sm text-white/60">加载中…</div>}
              {!discover.loading && (
                <>
                  <UserGrid data={discover.list} onToggle={discover.toggleFollow} />
                  <Pagination
                    page={discover.page}
                    total={discover.total}
                    onChange={discover.fetchList}
                  />
                </>
              )}
            </>
          )}
        </div>

        {/* 管理员审核区域 */}
        {user?.role === 1 && (
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">待审核申请</h2>
              <button
                onClick={fetchApplications}
                className="px-3 py-1 rounded-md bg-white/10 text-sm hover:bg-white/20 transition"
                disabled={loadingApplications}
              >
                {loadingApplications ? "刷新中..." : "刷新列表"}
              </button>
            </div>
            
            {loadingApplications && <div className="text-sm text-white/60">加载中…</div>}
            
            {!loadingApplications && applyList.length === 0 ? (
              <div className="text-sm text-white/60">暂无待审核申请</div>
            ) : (
              <div className="space-y-4">
                {applyList.map((a) => (
                  <div key={a.id} className="bg-white/10 p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{a.username} (UID: {a.uid})</div>
                      <div className="text-sm text-white/70 mt-1">理由：{a.reason || "未填写"}</div>
                      <div className="text-xs text-white/50 mt-1">{a.created}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => doAudit(a.id, 1)}
                        className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition"
                      >
                        通过
                      </button>
                      <button
                        onClick={() => doAudit(a.id, 2)}
                        className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------ 歌单区域组件 ------------------ */
function PlaylistSection({ title, list }: { title: string; list: any[] }) {
  return (
    <div className="mt-6 bg-white/5 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-2">{title}</h2>
      {list.length === 0 ? (
        <div className="text-sm text-white/60">未创建歌单</div>
      ) : (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {list.map((pl) => (
            <Link
              key={pl.name}
              href={`/playlists/${encodeURIComponent(pl.name)}`}
              className="bg-white/3 p-3 rounded-lg flex items-center gap-3 hover:scale-[1.01] transition"
            >
              <div className="w-16 h-16 bg-white/5 rounded overflow-hidden" />
              <div className="flex-1">
                <div className="font-medium truncate">{pl.name}</div>
                <div className="text-sm text-white/60">{pl.songs.length} 首</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------ Tab 按钮 ------------------ */
function TabBtn({ active, onClick, text }: { active: boolean; onClick: () => void; text: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-sm transition ${
        active ? "bg-white/20 text-white" : "bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      {text}
    </button>
  );
}