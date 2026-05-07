import { supabase } from "@/lib/supabase";

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "message";
  read: boolean;
  createdAt: string;
};

const map = (n: any): Notification => ({
  id: n.id,
  userId: n.user_id,
  title: n.title,
  message: n.message,
  type: n.type,
  read: n.read,
  createdAt: n.created_at,
});

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []).map(map);
};

export const markAllRead = async (userId: string) => {
  await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
};

export const markOneRead = async (id: string) => {
  await supabase.from("notifications").update({ read: true }).eq("id", id);
};

export const subscribeNotifications = (
  userId: string,
  onNew: (n: Notification) => void
) => {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      (payload) => onNew(map(payload.new))
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
};
