begin;

create schema if not exists extensions;
create schema if not exists security;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

revoke all on schema security from public, anon, authenticated;
grant usage on schema security to authenticated;

create type public.package_status as enum (
  'awaiting_identification',
  'awaiting_notification',
  'awaiting_pickup',
  'picked_up',
  'returned',
  'cancelled',
  'problem'
);

create type public.package_image_kind as enum (
  'label_original',
  'label_thumbnail',
  'pickup_proof'
);

create type public.notification_status as enum (
  'prepared',
  'sent_confirmed',
  'failed'
);

create type public.pickup_relation as enum (
  'resident',
  'family',
  'employee',
  'authorized_person',
  'other'
);

create or replace function security.normalize_text(value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent', value));
$$;

create or replace function security.try_uuid(value text)
returns uuid
language plpgsql
immutable
strict
set search_path = ''
as $$
begin
  return value::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

create table public.condominiums (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  address text,
  whatsapp_phone text,
  timezone text not null default 'America/Sao_Paulo',
  retention_days integer not null default 365 check (retention_days between 30 and 3650),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  phone text,
  is_active boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique check (code in ('admin', 'front_desk', 'manager')),
  label text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.user_condominiums (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  is_active boolean not null default true,
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, condominium_id)
);

create table public.user_roles (
  id uuid primary key default extensions.gen_random_uuid(),
  membership_id uuid not null references public.user_condominiums(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (membership_id, role_id)
);

create table public.blocks (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  code text not null,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (condominium_id, code),
  unique (condominium_id, label),
  unique (id, condominium_id)
);

create table public.units (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  block_id uuid not null,
  number text not null,
  label text,
  floor integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (block_id, number),
  unique (id, condominium_id),
  foreign key (block_id, condominium_id) references public.blocks(id, condominium_id) on delete restrict
);

create table public.residents (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  search_text text not null default '',
  phone text,
  email text,
  notes text,
  is_active boolean not null default true,
  moved_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, condominium_id)
);

create table public.resident_units (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  resident_id uuid not null,
  unit_id uuid not null,
  is_primary boolean not null default false,
  relationship_label text,
  is_active boolean not null default true,
  valid_from date not null default current_date,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resident_id, unit_id),
  check (valid_until is null or valid_until >= valid_from),
  foreign key (resident_id, condominium_id) references public.residents(id, condominium_id) on delete cascade,
  foreign key (unit_id, condominium_id) references public.units(id, condominium_id) on delete cascade
);

create table public.carriers (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid references public.condominiums(id) on delete cascade,
  name text not null,
  normalized_name text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (condominium_id, normalized_name)
);

create table public.message_templates (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  name text not null,
  body text not null check (char_length(body) between 10 and 1200),
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (condominium_id, name)
);

create table public.packages (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete restrict,
  unit_id uuid references public.units(id) on delete restrict,
  resident_id uuid references public.residents(id) on delete set null,
  recipient_name text not null check (char_length(trim(recipient_name)) between 2 and 160),
  tracking_code text,
  carrier_id uuid references public.carriers(id) on delete set null,
  carrier_name text,
  volume_type text not null default 'package' check (volume_type in ('envelope', 'package', 'box', 'large_volume', 'other')),
  quantity integer not null default 1 check (quantity between 1 and 99),
  notes text,
  status public.package_status not null default 'awaiting_identification',
  client_request_id uuid not null,
  duplicate_override_reason text,
  received_at timestamptz not null default now(),
  received_by uuid not null references public.profiles(id) on delete restrict,
  notified_at timestamptz,
  picked_up_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (condominium_id, client_request_id)
);

create table public.package_images (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  kind public.package_image_kind not null,
  storage_object_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sha256 text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.package_recognition_results (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  engine text not null default 'tesseract.js',
  engine_version text,
  extracted_fields jsonb not null default '{}'::jsonb,
  corrected_fields jsonb not null default '{}'::jsonb,
  confidence jsonb not null default '{}'::jsonb,
  raw_text text,
  was_skipped boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.package_notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  template_id uuid references public.message_templates(id) on delete set null,
  channel text not null default 'whatsapp' check (channel = 'whatsapp'),
  rendered_message text not null check (char_length(rendered_message) between 1 and 1600),
  phone_last4 text check (phone_last4 is null or phone_last4 ~ '^\d{4}$'),
  status public.notification_status not null,
  opened_at timestamptz,
  confirmed_at timestamptz,
  confirmed_by uuid references public.profiles(id) on delete restrict,
  failure_reason text,
  created_at timestamptz not null default now()
);

create table public.package_pickups (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete restrict,
  picked_up_by_name text not null check (char_length(trim(picked_up_by_name)) between 2 and 160),
  relation public.pickup_relation not null,
  document_last4 text check (document_last4 is null or document_last4 ~ '^[A-Za-z0-9]{2,8}$'),
  proof_storage_path text,
  notes text,
  picked_up_at timestamptz not null default now(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  voided_at timestamptz,
  voided_by uuid references public.profiles(id) on delete restrict,
  void_reason text,
  created_at timestamptz not null default now()
);

create table public.package_status_history (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  from_status public.package_status,
  to_status public.package_status not null,
  reason text,
  changed_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default extensions.gen_random_uuid(),
  condominium_id uuid not null references public.condominiums(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_by uuid references public.profiles(id) on delete set null,
  occurred_at timestamptz not null default now()
);

create index user_condominiums_user_active_idx on public.user_condominiums (user_id, is_active);
create index user_condominiums_condo_active_idx on public.user_condominiums (condominium_id, is_active);
create index user_roles_membership_idx on public.user_roles (membership_id);
create index blocks_condo_active_idx on public.blocks (condominium_id, is_active, sort_order);
create index units_condo_block_active_idx on public.units (condominium_id, block_id, is_active);
create index units_number_idx on public.units (number);
create index residents_condo_active_idx on public.residents (condominium_id, is_active);
create index residents_search_trgm_idx on public.residents using gin (search_text extensions.gin_trgm_ops);
create index resident_units_unit_active_idx on public.resident_units (unit_id, is_active);
create index resident_units_resident_active_idx on public.resident_units (resident_id, is_active);
create index carriers_condo_active_idx on public.carriers (condominium_id, is_active);
create index packages_condo_status_received_idx on public.packages (condominium_id, status, received_at desc);
create index packages_condo_unit_received_idx on public.packages (condominium_id, unit_id, received_at desc);
create index packages_condo_resident_received_idx on public.packages (condominium_id, resident_id, received_at desc);
create index packages_tracking_idx on public.packages (condominium_id, lower(tracking_code));
create index package_images_package_idx on public.package_images (package_id, kind);
create index recognition_package_idx on public.package_recognition_results (package_id, created_at desc);
create index notifications_package_idx on public.package_notifications (package_id, created_at desc);
create unique index pickups_one_active_per_package_idx on public.package_pickups (package_id) where voided_at is null;
create index status_history_package_idx on public.package_status_history (package_id, created_at desc);
create index audit_condo_time_idx on public.audit_events (condominium_id, occurred_at desc);
create index audit_entity_idx on public.audit_events (entity_type, entity_id, occurred_at desc);

insert into public.roles (code, label, description)
values
  ('admin', 'Administração', 'Configura condomínio, usuários, estrutura, auditoria e operações.'),
  ('front_desk', 'Portaria', 'Recebe, identifica, notifica, consulta e registra retiradas.'),
  ('manager', 'Gestão', 'Consulta indicadores, corrige operações e acessa auditoria.')
on conflict (code) do update
set label = excluded.label, description = excluded.description;

create or replace function security.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function security.prepare_search_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name = 'residents' then
    new.search_text = security.normalize_text(
      concat_ws(' ', new.full_name, coalesce(new.phone, ''), coalesce(new.email, ''))
    );
  elsif tg_table_name = 'carriers' then
    new.normalized_name = security.normalize_text(new.name);
  end if;
  return new;
end;
$$;

create trigger condominiums_updated_at before update on public.condominiums
for each row execute function security.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
for each row execute function security.set_updated_at();
create trigger user_condominiums_updated_at before update on public.user_condominiums
for each row execute function security.set_updated_at();
create trigger blocks_updated_at before update on public.blocks
for each row execute function security.set_updated_at();
create trigger units_updated_at before update on public.units
for each row execute function security.set_updated_at();
create trigger residents_updated_at before update on public.residents
for each row execute function security.set_updated_at();
create trigger resident_units_updated_at before update on public.resident_units
for each row execute function security.set_updated_at();
create trigger carriers_updated_at before update on public.carriers
for each row execute function security.set_updated_at();
create trigger message_templates_updated_at before update on public.message_templates
for each row execute function security.set_updated_at();
create trigger packages_updated_at before update on public.packages
for each row execute function security.set_updated_at();
create trigger residents_search_fields before insert or update of full_name, phone, email on public.residents
for each row execute function security.prepare_search_fields();
create trigger carriers_search_fields before insert or update of name on public.carriers
for each row execute function security.prepare_search_fields();

create or replace function security.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, is_active)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1), 'Operador'),
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function security.handle_new_auth_user();

create or replace function security.has_condominium_access(
  condominium uuid,
  required_roles text[] default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.profiles p
    join public.user_condominiums uc on uc.user_id = p.id
    left join public.user_roles ur on ur.membership_id = uc.id
    left join public.roles r on r.id = ur.role_id
    where p.id = (select auth.uid())
      and p.is_active
      and uc.condominium_id = condominium
      and uc.is_active
      and (required_roles is null or r.code = any(required_roles))
  );
$$;

create or replace function security.can_view_profile(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_user = (select auth.uid()) or exists (
    select 1
    from public.user_condominiums target_membership
    where target_membership.user_id = target_user
      and security.has_condominium_access(target_membership.condominium_id, array['admin'])
  );
$$;

revoke all on function security.has_condominium_access(uuid, text[]) from public;
revoke all on function security.can_view_profile(uuid) from public;
grant execute on function security.has_condominium_access(uuid, text[]) to authenticated;
grant execute on function security.can_view_profile(uuid) to authenticated;

create or replace function security.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_new jsonb := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  row_old jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  entity_id uuid := coalesce(security.try_uuid(row_new ->> 'id'), security.try_uuid(row_old ->> 'id'));
  condominium uuid := coalesce(
    security.try_uuid(row_new ->> 'condominium_id'),
    security.try_uuid(row_old ->> 'condominium_id')
  );
  changed_fields jsonb;
begin
  if condominium is null then
    return coalesce(new, old);
  end if;

  select coalesce(jsonb_agg(key order by key), '[]'::jsonb)
  into changed_fields
  from (
    select key
    from jsonb_object_keys(row_new || row_old) as fields(key)
    where row_new -> key is distinct from row_old -> key
      and key not in ('phone', 'email', 'notes', 'body', 'updated_at')
  ) changed;

  insert into public.audit_events (
    condominium_id,
    entity_type,
    entity_id,
    action,
    summary,
    metadata,
    occurred_by
  ) values (
    condominium,
    tg_table_name,
    entity_id,
    lower(tg_op),
    format('%s em %s', lower(tg_op), tg_table_name),
    jsonb_build_object('changed_fields', changed_fields),
    (select auth.uid())
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger audit_blocks after insert or update or delete on public.blocks
for each row execute function security.audit_row_change();
create trigger audit_units after insert or update or delete on public.units
for each row execute function security.audit_row_change();
create trigger audit_residents after insert or update or delete on public.residents
for each row execute function security.audit_row_change();
create trigger audit_resident_units after insert or update or delete on public.resident_units
for each row execute function security.audit_row_change();
create trigger audit_carriers after insert or update or delete on public.carriers
for each row execute function security.audit_row_change();
create trigger audit_templates after insert or update or delete on public.message_templates
for each row execute function security.audit_row_change();
create trigger audit_memberships after insert or update or delete on public.user_condominiums
for each row execute function security.audit_row_change();

alter table public.condominiums enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_condominiums enable row level security;
alter table public.user_roles enable row level security;
alter table public.blocks enable row level security;
alter table public.units enable row level security;
alter table public.residents enable row level security;
alter table public.resident_units enable row level security;
alter table public.carriers enable row level security;
alter table public.message_templates enable row level security;
alter table public.packages enable row level security;
alter table public.package_images enable row level security;
alter table public.package_recognition_results enable row level security;
alter table public.package_notifications enable row level security;
alter table public.package_pickups enable row level security;
alter table public.package_status_history enable row level security;
alter table public.audit_events enable row level security;

create policy condominiums_select on public.condominiums for select to authenticated
using ((select security.has_condominium_access(id)));
create policy condominiums_update on public.condominiums for update to authenticated
using ((select security.has_condominium_access(id, array['admin'])))
with check ((select security.has_condominium_access(id, array['admin'])));

create policy profiles_select on public.profiles for select to authenticated
using ((select security.can_view_profile(id)));

create policy roles_select on public.roles for select to authenticated using (true);

create policy memberships_select on public.user_condominiums for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy memberships_insert on public.user_condominiums for insert to authenticated
with check ((select security.has_condominium_access(condominium_id, array['admin'])));
create policy memberships_update on public.user_condominiums for update to authenticated
using ((select security.has_condominium_access(condominium_id, array['admin'])))
with check ((select security.has_condominium_access(condominium_id, array['admin'])));

create policy user_roles_select on public.user_roles for select to authenticated
using (exists (
  select 1 from public.user_condominiums uc
  where uc.id = membership_id
    and (uc.user_id = (select auth.uid()) or (select security.has_condominium_access(uc.condominium_id, array['admin'])))
));
create policy user_roles_insert on public.user_roles for insert to authenticated
with check (exists (
  select 1 from public.user_condominiums uc
  where uc.id = membership_id
    and (select security.has_condominium_access(uc.condominium_id, array['admin']))
));
create policy user_roles_delete on public.user_roles for delete to authenticated
using (exists (
  select 1 from public.user_condominiums uc
  where uc.id = membership_id
    and (select security.has_condominium_access(uc.condominium_id, array['admin']))
));

create policy blocks_select on public.blocks for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy blocks_insert on public.blocks for insert to authenticated
with check ((select security.has_condominium_access(condominium_id, array['admin'])));
create policy blocks_update on public.blocks for update to authenticated
using ((select security.has_condominium_access(condominium_id, array['admin'])))
with check ((select security.has_condominium_access(condominium_id, array['admin'])));

create policy units_select on public.units for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy units_insert on public.units for insert to authenticated
with check ((select security.has_condominium_access(condominium_id, array['admin'])));
create policy units_update on public.units for update to authenticated
using ((select security.has_condominium_access(condominium_id, array['admin'])))
with check ((select security.has_condominium_access(condominium_id, array['admin'])));

create policy residents_select on public.residents for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy residents_insert on public.residents for insert to authenticated
with check ((select security.has_condominium_access(condominium_id, array['admin', 'manager'])));
create policy residents_update on public.residents for update to authenticated
using ((select security.has_condominium_access(condominium_id, array['admin', 'manager'])))
with check ((select security.has_condominium_access(condominium_id, array['admin', 'manager'])));

create policy resident_units_select on public.resident_units for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy resident_units_insert on public.resident_units for insert to authenticated
with check ((select security.has_condominium_access(condominium_id, array['admin', 'manager'])));
create policy resident_units_update on public.resident_units for update to authenticated
using ((select security.has_condominium_access(condominium_id, array['admin', 'manager'])))
with check ((select security.has_condominium_access(condominium_id, array['admin', 'manager'])));

create policy carriers_select on public.carriers for select to authenticated
using (condominium_id is null or (select security.has_condominium_access(condominium_id)));
create policy carriers_insert on public.carriers for insert to authenticated
with check (condominium_id is not null and (select security.has_condominium_access(condominium_id, array['admin'])));
create policy carriers_update on public.carriers for update to authenticated
using (condominium_id is not null and (select security.has_condominium_access(condominium_id, array['admin'])))
with check (condominium_id is not null and (select security.has_condominium_access(condominium_id, array['admin'])));

create policy templates_select on public.message_templates for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy templates_insert on public.message_templates for insert to authenticated
with check ((select security.has_condominium_access(condominium_id, array['admin'])));
create policy templates_update on public.message_templates for update to authenticated
using ((select security.has_condominium_access(condominium_id, array['admin'])))
with check ((select security.has_condominium_access(condominium_id, array['admin'])));

create policy packages_select on public.packages for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy package_images_select on public.package_images for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy recognition_select on public.package_recognition_results for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy notifications_select on public.package_notifications for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy pickups_select on public.package_pickups for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy status_history_select on public.package_status_history for select to authenticated
using ((select security.has_condominium_access(condominium_id)));
create policy audit_select on public.audit_events for select to authenticated
using ((select security.has_condominium_access(condominium_id, array['admin', 'manager'])));

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.condominiums, public.profiles, public.roles, public.user_condominiums,
  public.user_roles, public.blocks, public.units, public.residents, public.resident_units,
  public.carriers, public.message_templates, public.packages, public.package_images,
  public.package_recognition_results, public.package_notifications, public.package_pickups,
  public.package_status_history, public.audit_events to authenticated;
grant update (name, address, whatsapp_phone, timezone, retention_days, is_active)
  on public.condominiums to authenticated;
grant insert, update on public.blocks, public.units, public.residents, public.resident_units,
  public.carriers, public.message_templates, public.user_condominiums to authenticated;
grant insert, delete on public.user_roles to authenticated;

create or replace function public.search_residents(
  p_condominium_id uuid,
  p_query text default '',
  p_limit integer default 20
)
returns table (
  resident_id uuid,
  full_name text,
  phone text,
  is_active boolean,
  unit_id uuid,
  unit_number text,
  block_id uuid,
  block_label text,
  is_primary boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not security.has_condominium_access(p_condominium_id) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;

  return query
  select
    r.id,
    r.full_name,
    r.phone,
    r.is_active,
    u.id,
    u.number,
    b.id,
    b.label,
    ru.is_primary
  from public.residents r
  join public.resident_units ru on ru.resident_id = r.id and ru.is_active
  join public.units u on u.id = ru.unit_id and u.is_active
  join public.blocks b on b.id = u.block_id and b.is_active
  where r.condominium_id = p_condominium_id
    and r.is_active
    and (
      nullif(trim(p_query), '') is null
      or r.search_text like '%' || security.normalize_text(trim(p_query)) || '%'
      or security.normalize_text(u.number) like '%' || security.normalize_text(trim(p_query)) || '%'
      or security.normalize_text(b.label) like '%' || security.normalize_text(trim(p_query)) || '%'
    )
  order by
    case when r.search_text = security.normalize_text(trim(p_query)) then 0 else 1 end,
    r.full_name,
    b.sort_order,
    u.number
  limit least(greatest(p_limit, 1), 50);
end;
$$;

create or replace function public.get_dashboard_stats(p_condominium_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if not security.has_condominium_access(p_condominium_id) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'received_today', count(*) filter (where received_at >= date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'),
    'awaiting_identification', count(*) filter (where status = 'awaiting_identification'),
    'awaiting_notification', count(*) filter (where status = 'awaiting_notification'),
    'awaiting_pickup', count(*) filter (where status = 'awaiting_pickup'),
    'picked_up_today', count(*) filter (where status = 'picked_up' and picked_up_at >= date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'),
    'older_than_24h', count(*) filter (where status in ('awaiting_identification', 'awaiting_notification', 'awaiting_pickup') and received_at < now() - interval '24 hours'),
    'problems', count(*) filter (where status = 'problem')
  ) into result
  from public.packages
  where condominium_id = p_condominium_id;

  return coalesce(result, '{}'::jsonb);
end;
$$;

create or replace function public.search_packages(
  p_condominium_id uuid,
  p_query text default null,
  p_status public.package_status default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_old_only boolean default false,
  p_limit integer default 25,
  p_offset integer default 0
)
returns table (
  id uuid,
  recipient_name text,
  tracking_code text,
  carrier_name text,
  status public.package_status,
  received_at timestamptz,
  notified_at timestamptz,
  picked_up_at timestamptz,
  version integer,
  notes text,
  unit_id uuid,
  resident_id uuid,
  unit_number text,
  unit_label text,
  block_code text,
  block_label text,
  resident_full_name text,
  resident_phone text,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not security.has_condominium_access(p_condominium_id) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;
  return query
  select
    p.id, p.recipient_name, p.tracking_code, p.carrier_name, p.status,
    p.received_at, p.notified_at, p.picked_up_at, p.version, p.notes,
    p.unit_id, p.resident_id, u.number, u.label, b.code, b.label,
    r.full_name, r.phone, count(*) over()
  from public.packages p
  left join public.units u on u.id = p.unit_id and u.condominium_id = p.condominium_id
  left join public.blocks b on b.id = u.block_id and b.condominium_id = p.condominium_id
  left join public.residents r on r.id = p.resident_id and r.condominium_id = p.condominium_id
  left join public.profiles operator on operator.id = p.received_by
  where p.condominium_id = p_condominium_id
    and (p_status is null or p.status = p_status)
    and (p_from is null or p.received_at >= p_from)
    and (p_to is null or p.received_at < p_to)
    and (
      not p_old_only or (
        p.received_at < now() - interval '72 hours'
        and p.status in ('awaiting_identification', 'awaiting_notification', 'awaiting_pickup', 'problem')
      )
    )
    and (
      nullif(trim(p_query), '') is null
      or security.normalize_text(concat_ws(' ',
        p.recipient_name, p.tracking_code, p.carrier_name,
        u.number, u.label, b.code, b.label, r.full_name, operator.full_name
      )) like '%' || security.normalize_text(trim(p_query)) || '%'
    )
  order by p.received_at desc
  limit least(greatest(p_limit, 1), 100)
  offset greatest(p_offset, 0);
end;
$$;

create or replace function public.find_package_duplicates(
  p_condominium_id uuid,
  p_tracking_code text default null,
  p_unit_id uuid default null,
  p_resident_id uuid default null,
  p_carrier_name text default null
)
returns table (
  package_id uuid,
  recipient_name text,
  tracking_code text,
  status public.package_status,
  received_at timestamptz,
  score integer,
  reasons text[]
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not security.has_condominium_access(p_condominium_id) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;

  return query
  with scored as (
    select
      p.id,
      p.recipient_name,
      p.tracking_code,
      p.status,
      p.received_at,
      (case when nullif(trim(p_tracking_code), '') is not null and lower(p.tracking_code) = lower(trim(p_tracking_code)) then 5 else 0 end)
      + (case when p_unit_id is not null and p.unit_id = p_unit_id then 2 else 0 end)
      + (case when p_resident_id is not null and p.resident_id = p_resident_id then 2 else 0 end)
      + (case when nullif(trim(p_carrier_name), '') is not null and security.normalize_text(coalesce(p.carrier_name, '')) = security.normalize_text(trim(p_carrier_name)) then 1 else 0 end)
      + (case when p.received_at > now() - interval '2 hours' then 1 else 0 end) as duplicate_score,
      array_remove(array[
        case when nullif(trim(p_tracking_code), '') is not null and lower(p.tracking_code) = lower(trim(p_tracking_code)) then 'Mesmo código de rastreio' end,
        case when p_unit_id is not null and p.unit_id = p_unit_id then 'Mesma unidade' end,
        case when p_resident_id is not null and p.resident_id = p_resident_id then 'Mesmo morador' end,
        case when nullif(trim(p_carrier_name), '') is not null and security.normalize_text(coalesce(p.carrier_name, '')) = security.normalize_text(trim(p_carrier_name)) then 'Mesma transportadora' end,
        case when p.received_at > now() - interval '2 hours' then 'Recebida há menos de duas horas' end
      ], null) as duplicate_reasons
    from public.packages p
    where p.condominium_id = p_condominium_id
      and p.received_at > now() - interval '24 hours'
      and p.status not in ('cancelled', 'returned')
  )
  select id, scored.recipient_name, scored.tracking_code, scored.status, scored.received_at,
    duplicate_score, duplicate_reasons
  from scored
  where duplicate_score >= 3
  order by duplicate_score desc, scored.received_at desc
  limit 10;
end;
$$;

create or replace function public.create_package_intake(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  condominium uuid := security.try_uuid(p_payload ->> 'condominium_id');
  package_id uuid := coalesce(security.try_uuid(p_payload ->> 'id'), extensions.gen_random_uuid());
  request_id uuid := security.try_uuid(p_payload ->> 'client_request_id');
  selected_unit uuid := security.try_uuid(p_payload ->> 'unit_id');
  selected_resident uuid := security.try_uuid(p_payload ->> 'resident_id');
  selected_carrier uuid := security.try_uuid(p_payload ->> 'carrier_id');
  initial_status public.package_status;
  existing_id uuid;
  image jsonb;
begin
  if actor is null or condominium is null or request_id is null then
    raise exception 'INVALID_CONTEXT' using errcode = '22023';
  end if;
  if not security.has_condominium_access(condominium, array['admin', 'front_desk', 'manager']) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;

  select p.id into existing_id
  from public.packages p
  where p.condominium_id = condominium and p.client_request_id = request_id;
  if existing_id is not null then
    return existing_id;
  end if;

  if selected_unit is not null and not exists (
    select 1 from public.units u
    where u.id = selected_unit and u.condominium_id = condominium and u.is_active
  ) then
    raise exception 'INVALID_UNIT' using errcode = '23503';
  end if;

  if selected_resident is not null and not exists (
    select 1
    from public.residents r
    join public.resident_units ru on ru.resident_id = r.id and ru.is_active
    where r.id = selected_resident
      and r.condominium_id = condominium
      and r.is_active
      and (selected_unit is null or ru.unit_id = selected_unit)
  ) then
    raise exception 'INVALID_RESIDENT' using errcode = '23503';
  end if;

  if selected_carrier is not null and not exists (
    select 1 from public.carriers c
    where c.id = selected_carrier and (c.condominium_id is null or c.condominium_id = condominium)
  ) then
    raise exception 'INVALID_CARRIER' using errcode = '23503';
  end if;

  initial_status := case when selected_unit is null then 'awaiting_identification'::public.package_status else 'awaiting_notification'::public.package_status end;

  insert into public.packages (
    id, condominium_id, unit_id, resident_id, recipient_name, tracking_code,
    carrier_id, carrier_name, volume_type, quantity, notes, status,
    client_request_id, duplicate_override_reason, received_by
  ) values (
    package_id,
    condominium,
    selected_unit,
    selected_resident,
    trim(p_payload ->> 'recipient_name'),
    nullif(trim(p_payload ->> 'tracking_code'), ''),
    selected_carrier,
    nullif(trim(p_payload ->> 'carrier_name'), ''),
    coalesce(nullif(p_payload ->> 'volume_type', ''), 'package'),
    coalesce((p_payload ->> 'quantity')::integer, 1),
    nullif(trim(p_payload ->> 'notes'), ''),
    initial_status,
    request_id,
    nullif(trim(p_payload ->> 'duplicate_override_reason'), ''),
    actor
  );

  for image in select value from jsonb_array_elements(coalesce(p_payload -> 'images', '[]'::jsonb)) loop
    insert into public.package_images (
      condominium_id, package_id, kind, storage_object_path, mime_type,
      size_bytes, width, height, sha256, created_by
    ) values (
      condominium,
      package_id,
      (image ->> 'kind')::public.package_image_kind,
      image ->> 'storage_object_path',
      image ->> 'mime_type',
      (image ->> 'size_bytes')::integer,
      nullif(image ->> 'width', '')::integer,
      nullif(image ->> 'height', '')::integer,
      nullif(image ->> 'sha256', ''),
      actor
    );
  end loop;

  if p_payload ? 'recognition' then
    insert into public.package_recognition_results (
      condominium_id, package_id, engine, engine_version, extracted_fields,
      corrected_fields, confidence, raw_text, was_skipped, created_by
    ) values (
      condominium,
      package_id,
      coalesce(p_payload #>> '{recognition,engine}', 'tesseract.js'),
      nullif(p_payload #>> '{recognition,engine_version}', ''),
      coalesce(p_payload #> '{recognition,extracted_fields}', '{}'::jsonb),
      coalesce(p_payload #> '{recognition,corrected_fields}', '{}'::jsonb),
      coalesce(p_payload #> '{recognition,confidence}', '{}'::jsonb),
      nullif(p_payload #>> '{recognition,raw_text}', ''),
      coalesce((p_payload #>> '{recognition,was_skipped}')::boolean, false),
      actor
    );
  end if;

  insert into public.package_status_history (
    condominium_id, package_id, from_status, to_status, reason, changed_by
  ) values (
    condominium, package_id, null, initial_status, 'Encomenda recebida', actor
  );

  insert into public.audit_events (
    condominium_id, entity_type, entity_id, action, summary, metadata, occurred_by
  ) values (
    condominium,
    'packages',
    package_id,
    'create',
    'Encomenda recebida',
    jsonb_build_object(
      'status', initial_status,
      'has_label_image', jsonb_array_length(coalesce(p_payload -> 'images', '[]'::jsonb)) > 0,
      'ocr_skipped', coalesce((p_payload #>> '{recognition,was_skipped}')::boolean, false)
    ),
    actor
  );

  return package_id;
end;
$$;

create or replace function public.record_package_notification(
  p_package_id uuid,
  p_rendered_message text,
  p_phone_last4 text default null,
  p_template_id uuid default null,
  p_opened_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  target public.packages%rowtype;
  old_status public.package_status;
begin
  select * into target from public.packages where id = p_package_id for update;
  if target.id is null then raise exception 'PACKAGE_NOT_FOUND' using errcode = 'P0002'; end if;
  if not security.has_condominium_access(target.condominium_id, array['admin', 'front_desk', 'manager']) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;
  if target.status not in ('awaiting_notification', 'awaiting_pickup') then
    raise exception 'INVALID_PACKAGE_STATUS' using errcode = 'P0001';
  end if;

  insert into public.package_notifications (
    condominium_id, package_id, template_id, rendered_message, phone_last4,
    status, opened_at, confirmed_at, confirmed_by
  ) values (
    target.condominium_id, target.id, p_template_id, p_rendered_message,
    p_phone_last4, 'sent_confirmed', p_opened_at, now(), actor
  );

  old_status := target.status;
  if target.status = 'awaiting_notification' then
    update public.packages
    set status = 'awaiting_pickup', notified_at = now(), version = version + 1
    where id = target.id;

    insert into public.package_status_history (
      condominium_id, package_id, from_status, to_status, reason, changed_by
    ) values (
      target.condominium_id, target.id, old_status, 'awaiting_pickup',
      'Envio pelo WhatsApp confirmado pelo operador', actor
    );
  end if;

  insert into public.audit_events (
    condominium_id, entity_type, entity_id, action, summary, metadata, occurred_by
  ) values (
    target.condominium_id, 'packages', target.id, 'notify',
    'Envio assistido confirmado', jsonb_build_object('channel', 'whatsapp'), actor
  );

  return jsonb_build_object('package_id', target.id, 'status', 'awaiting_pickup');
end;
$$;

create or replace function public.complete_package_pickup(
  p_package_id uuid,
  p_expected_version integer,
  p_picked_up_by_name text,
  p_relation public.pickup_relation,
  p_document_last4 text default null,
  p_proof_storage_path text default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  target public.packages%rowtype;
begin
  select * into target from public.packages where id = p_package_id for update;
  if target.id is null then raise exception 'PACKAGE_NOT_FOUND' using errcode = 'P0002'; end if;
  if not security.has_condominium_access(target.condominium_id, array['admin', 'front_desk', 'manager']) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;
  if target.status = 'picked_up' or exists (
    select 1 from public.package_pickups pp where pp.package_id = target.id and pp.voided_at is null
  ) then
    raise exception 'PACKAGE_ALREADY_PICKED_UP' using errcode = '23505';
  end if;
  if target.status not in ('awaiting_pickup', 'awaiting_notification') then
    raise exception 'INVALID_PACKAGE_STATUS' using errcode = 'P0001';
  end if;
  if target.version <> p_expected_version then
    raise exception 'PACKAGE_VERSION_CONFLICT' using errcode = '40001';
  end if;

  insert into public.package_pickups (
    condominium_id, package_id, picked_up_by_name, relation, document_last4,
    proof_storage_path, notes, created_by
  ) values (
    target.condominium_id, target.id, trim(p_picked_up_by_name), p_relation,
    nullif(trim(p_document_last4), ''), nullif(trim(p_proof_storage_path), ''),
    nullif(trim(p_notes), ''), actor
  );

  update public.packages
  set status = 'picked_up', picked_up_at = now(), version = version + 1
  where id = target.id;

  insert into public.package_status_history (
    condominium_id, package_id, from_status, to_status, reason, changed_by
  ) values (
    target.condominium_id, target.id, target.status, 'picked_up',
    'Retirada confirmada', actor
  );

  insert into public.audit_events (
    condominium_id, entity_type, entity_id, action, summary, metadata, occurred_by
  ) values (
    target.condominium_id, 'packages', target.id, 'pickup', 'Retirada confirmada',
    jsonb_build_object('relation', p_relation, 'has_proof', p_proof_storage_path is not null), actor
  );

  return jsonb_build_object('package_id', target.id, 'status', 'picked_up', 'version', target.version + 1);
end;
$$;

create or replace function public.reopen_package(
  p_package_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  target public.packages%rowtype;
begin
  select * into target from public.packages where id = p_package_id for update;
  if target.id is null then raise exception 'PACKAGE_NOT_FOUND' using errcode = 'P0002'; end if;
  if not security.has_condominium_access(target.condominium_id, array['admin']) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;
  if target.status <> 'picked_up' then raise exception 'PACKAGE_NOT_PICKED_UP' using errcode = 'P0001'; end if;
  if char_length(trim(p_reason)) < 8 then raise exception 'REASON_REQUIRED' using errcode = '22023'; end if;

  update public.package_pickups
  set voided_at = now(), voided_by = actor, void_reason = trim(p_reason)
  where package_id = target.id and voided_at is null;
  update public.packages
  set status = 'awaiting_pickup', picked_up_at = null, version = version + 1
  where id = target.id;

  insert into public.package_status_history (
    condominium_id, package_id, from_status, to_status, reason, changed_by
  ) values (
    target.condominium_id, target.id, 'picked_up', 'awaiting_pickup', trim(p_reason), actor
  );

  insert into public.audit_events (
    condominium_id, entity_type, entity_id, action, summary, metadata, occurred_by
  ) values (
    target.condominium_id, 'packages', target.id, 'reopen', 'Retirada reaberta pela administração',
    jsonb_build_object('reason', trim(p_reason)), actor
  );

  return jsonb_build_object('package_id', target.id, 'status', 'awaiting_pickup', 'version', target.version + 1);
end;
$$;

create or replace function public.anonymize_resident(
  p_resident_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  target public.residents%rowtype;
begin
  select * into target from public.residents where id = p_resident_id for update;
  if target.id is null then raise exception 'RESIDENT_NOT_FOUND' using errcode = 'P0002'; end if;
  if not security.has_condominium_access(target.condominium_id, array['admin']) then
    raise exception 'ACCESS_DENIED' using errcode = '42501';
  end if;
  if char_length(trim(p_reason)) < 8 then raise exception 'REASON_REQUIRED' using errcode = '22023'; end if;
  if exists (
    select 1 from public.packages p
    where p.resident_id = target.id
      and p.status in ('awaiting_identification', 'awaiting_notification', 'awaiting_pickup', 'problem')
  ) then
    raise exception 'RESIDENT_HAS_OPEN_PACKAGES' using errcode = 'P0001';
  end if;

  update public.resident_units
  set is_active = false, valid_until = current_date
  where resident_id = target.id and is_active;

  update public.residents
  set full_name = 'Morador removido ' || left(target.id::text, 8),
      phone = null,
      email = null,
      notes = null,
      is_active = false,
      moved_out_at = now()
  where id = target.id;

  insert into public.audit_events (
    condominium_id, entity_type, entity_id, action, summary, metadata, occurred_by
  ) values (
    target.condominium_id, 'residents', target.id, 'anonymize',
    'Cadastro de morador anonimizado', jsonb_build_object('reason', trim(p_reason)), actor
  );

  return jsonb_build_object('resident_id', target.id, 'anonymized', true);
end;
$$;

revoke all on function public.search_residents(uuid, text, integer) from public;
revoke all on function public.get_dashboard_stats(uuid) from public;
revoke all on function public.search_packages(uuid, text, public.package_status, timestamptz, timestamptz, boolean, integer, integer) from public;
revoke all on function public.find_package_duplicates(uuid, text, uuid, uuid, text) from public;
revoke all on function public.create_package_intake(jsonb) from public;
revoke all on function public.record_package_notification(uuid, text, text, uuid, timestamptz) from public;
revoke all on function public.complete_package_pickup(uuid, integer, text, public.pickup_relation, text, text, text) from public;
revoke all on function public.reopen_package(uuid, text) from public;
revoke all on function public.anonymize_resident(uuid, text) from public;

grant execute on function public.search_residents(uuid, text, integer) to authenticated;
grant execute on function public.get_dashboard_stats(uuid) to authenticated;
grant execute on function public.search_packages(uuid, text, public.package_status, timestamptz, timestamptz, boolean, integer, integer) to authenticated;
grant execute on function public.find_package_duplicates(uuid, text, uuid, uuid, text) to authenticated;
grant execute on function public.create_package_intake(jsonb) to authenticated;
grant execute on function public.record_package_notification(uuid, text, text, uuid, timestamptz) to authenticated;
grant execute on function public.complete_package_pickup(uuid, integer, text, public.pickup_relation, text, text, text) to authenticated;
grant execute on function public.reopen_package(uuid, text) to authenticated;
grant execute on function public.anonymize_resident(uuid, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'package-evidence',
  'package-evidence',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists package_evidence_select on storage.objects;
create policy package_evidence_select on storage.objects for select to authenticated
using (
  bucket_id = 'package-evidence'
  and security.has_condominium_access(security.try_uuid((storage.foldername(name))[1]))
);

drop policy if exists package_evidence_insert on storage.objects;
create policy package_evidence_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'package-evidence'
  and owner_id = (select auth.uid()::text)
  and security.has_condominium_access(security.try_uuid((storage.foldername(name))[1]), array['admin', 'front_desk', 'manager'])
);

drop policy if exists package_evidence_delete_own on storage.objects;
create policy package_evidence_delete_own on storage.objects for delete to authenticated
using (
  bucket_id = 'package-evidence'
  and owner_id = (select auth.uid()::text)
  and security.has_condominium_access(security.try_uuid((storage.foldername(name))[1]))
);

commit;
