-- Dados estritamente sintéticos para desenvolvimento. Nenhuma linha vem do SQLite legado.
insert into public.condominiums (id, name, slug, address, whatsapp_phone, retention_days)
values
  ('11111111-1111-4111-8111-111111111111', 'Condomínio Piloto', 'condominio-piloto', 'Endereço de teste', '5511999990000', 365),
  ('22222222-2222-4222-8222-222222222222', 'Condomínio Isolamento', 'condominio-isolamento', 'Endereço de teste B', '5511888880000', 365)
on conflict (id) do update set name = excluded.name, address = excluded.address;

do $$
declare
  block_number integer;
  unit_number integer;
  target_block uuid;
  target_unit uuid;
  target_resident uuid;
  resident_number integer;
  hash text;
begin
  for block_number in 1..41 loop
    insert into public.blocks (condominium_id, code, label, sort_order)
    values ('11111111-1111-4111-8111-111111111111', lpad(block_number::text, 2, '0'), 'Bloco ' || lpad(block_number::text, 2, '0'), block_number)
    on conflict (condominium_id, code) do update set label = excluded.label
    returning id into target_block;

    for unit_number in 1..34 loop
      insert into public.units (condominium_id, block_id, number, label, floor)
      values (
        '11111111-1111-4111-8111-111111111111',
        target_block,
        unit_number::text,
        'Apto ' || unit_number,
        greatest(0, ceil(unit_number / 4.0)::integer - 1)
      )
      on conflict (block_id, number) do update set label = excluded.label;
    end loop;
  end loop;

  for block_number in 1..2 loop
    insert into public.blocks (condominium_id, code, label, sort_order)
    values ('22222222-2222-4222-8222-222222222222', 'B' || block_number, 'Torre B' || block_number, block_number)
    on conflict (condominium_id, code) do update set label = excluded.label
    returning id into target_block;
    for unit_number in 1..4 loop
      insert into public.units (condominium_id, block_id, number, label)
      values ('22222222-2222-4222-8222-222222222222', target_block, (100 + unit_number)::text, 'Apto ' || (100 + unit_number))
      on conflict (block_id, number) do update set label = excluded.label;
    end loop;
  end loop;

  for resident_number in 1..120 loop
    hash := md5('condologpro-resident-a-' || resident_number);
    target_resident := (substr(hash, 1, 8) || '-' || substr(hash, 9, 4) || '-4' || substr(hash, 14, 3) || '-8' || substr(hash, 18, 3) || '-' || substr(hash, 21, 12))::uuid;
    select id into target_unit from public.units
      where condominium_id = '11111111-1111-4111-8111-111111111111'
      order by block_id, number
      offset resident_number - 1 limit 1;
    insert into public.residents (id, condominium_id, full_name, phone, email)
    values (target_resident, '11111111-1111-4111-8111-111111111111', 'Morador de Teste ' || lpad(resident_number::text, 3, '0'), '55119000' || lpad(resident_number::text, 4, '0'), 'morador' || resident_number || '@example.invalid')
    on conflict (id) do update set full_name = excluded.full_name, phone = excluded.phone;
    insert into public.resident_units (condominium_id, resident_id, unit_id, is_primary)
    values ('11111111-1111-4111-8111-111111111111', target_resident, target_unit, true)
    on conflict (resident_id, unit_id) do update set is_active = true;
  end loop;

  hash := md5('condologpro-resident-b-1');
  target_resident := (substr(hash, 1, 8) || '-' || substr(hash, 9, 4) || '-4' || substr(hash, 14, 3) || '-8' || substr(hash, 18, 3) || '-' || substr(hash, 21, 12))::uuid;
  select id into target_unit from public.units where condominium_id = '22222222-2222-4222-8222-222222222222' order by number limit 1;
  insert into public.residents (id, condominium_id, full_name, phone)
  values (target_resident, '22222222-2222-4222-8222-222222222222', 'Morador Isolado', '551188880001')
  on conflict (id) do update set full_name = excluded.full_name;
  insert into public.resident_units (condominium_id, resident_id, unit_id, is_primary)
  values ('22222222-2222-4222-8222-222222222222', target_resident, target_unit, true)
  on conflict (resident_id, unit_id) do update set is_active = true;
end $$;

insert into public.carriers (condominium_id, name)
values
  (null, 'Correios'),
  (null, 'Mercado Livre'),
  (null, 'Amazon'),
  (null, 'Shopee'),
  (null, 'Jadlog'),
  (null, 'Loggi')
on conflict (condominium_id, normalized_name) do nothing;

insert into public.message_templates (condominium_id, name, body, is_default)
values
  ('11111111-1111-4111-8111-111111111111', 'Aviso padrão', 'Olá, {{morador}}. Uma encomenda foi recebida na portaria do {{condominio}} para {{unidade}}{{codigo}}. Apresente-se na portaria para a retirada.', true),
  ('22222222-2222-4222-8222-222222222222', 'Aviso padrão', 'Olá, {{morador}}. Uma encomenda foi recebida na portaria do {{condominio}} para {{unidade}}{{codigo}}. Apresente-se na portaria para a retirada.', true)
on conflict (condominium_id, name) do update set body = excluded.body, is_default = true;
