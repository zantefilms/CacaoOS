-- Crea automáticamente la fila de public.users cuando alguien se registra
-- en auth.users (Sign in with Apple, Google, o email+contraseña). Sin esto,
-- un usuario recién registrado no tendría fila de perfil hasta que algo del
-- lado de la app la insertara a mano — ventana de bugs innecesaria, sobre
-- todo porque casi todo lo demás en el esquema referencia public.users.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
