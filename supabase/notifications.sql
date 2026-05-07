-- Run this in Supabase SQL Editor

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'order', -- 'order' | 'message'
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "Users can read own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update using (auth.uid() = user_id);

-- Trigger: auto-create notification when order status changes
create or replace function notify_order_status_change()
returns trigger language plpgsql as $$
declare
  label text;
begin
  if NEW.status = OLD.status then return NEW; end if;
  label := case NEW.status
    when 'processing' then 'Your order is being processed 📦'
    when 'shipped'    then 'Your order has been shipped! 🚚'
    when 'delivered'  then 'Your order has been delivered! ✅'
    when 'cancelled'  then 'Your order has been cancelled ❌'
    else null
  end;
  if label is not null then
    insert into notifications (user_id, title, message, type)
    values (NEW.user_id, label, 'Order #' || NEW.order_number, 'order');
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_order_status_change on orders;
create trigger on_order_status_change
  after update on orders
  for each row execute function notify_order_status_change();
