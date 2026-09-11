create table if not exists public.bible_books (
  usfm text primary key,
  canonical_order int not null unique,
  name_pt text not null,
  testament text not null check (testament in ('AT','NT')),
  division text not null,
  chapter_count int not null check (chapter_count > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.bible_chapters (
  book_usfm text not null references public.bible_books(usfm) on delete cascade,
  chapter_number int not null check (chapter_number > 0),
  verse_count int not null check (verse_count > 0),
  primary key (book_usfm, chapter_number)
);

create index if not exists bible_books_order_idx on public.bible_books (canonical_order);
create index if not exists bible_chapters_book_idx on public.bible_chapters (book_usfm, chapter_number);

grant select on public.bible_books to anon, authenticated;
grant select on public.bible_chapters to anon, authenticated;
grant all on public.bible_books to service_role;
grant all on public.bible_chapters to service_role;

alter table public.bible_books enable row level security;
alter table public.bible_chapters enable row level security;

drop policy if exists "bible_books_read" on public.bible_books;
create policy "bible_books_read" on public.bible_books for select to anon, authenticated using (true);
drop policy if exists "bible_chapters_read" on public.bible_chapters;
create policy "bible_chapters_read" on public.bible_chapters for select to anon, authenticated using (true);

create or replace function public.validate_reading_passage()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_start_verses int;
  v_end_verses int;
begin
  select verse_count into v_start_verses
  from public.bible_chapters
  where book_usfm = new.book_id and chapter_number = new.start_chapter;

  if v_start_verses is null then
    raise exception 'Livro ou capitulo inicial inexistente: % %', new.book_id, new.start_chapter;
  end if;

  select verse_count into v_end_verses
  from public.bible_chapters
  where book_usfm = new.book_id and chapter_number = new.end_chapter;

  if v_end_verses is null then
    raise exception 'Capitulo final inexistente: % %', new.book_id, new.end_chapter;
  end if;

  if new.end_chapter < new.start_chapter then
    raise exception 'Intervalo de capitulos invertido';
  end if;

  new.start_verse := greatest(coalesce(nullif(new.start_verse, 0), 1), 1);
  if new.start_verse > v_start_verses then
    raise exception 'Versiculo inicial % inexistente em % %', new.start_verse, new.book_id, new.start_chapter;
  end if;

  if new.end_verse is null or new.end_verse = 0 then
    new.end_verse := v_end_verses;
  end if;
  if new.end_verse > v_end_verses then
    new.end_verse := v_end_verses;
  end if;

  if new.start_chapter = new.end_chapter and new.end_verse < new.start_verse then
    raise exception 'Versiculo final menor que o inicial';
  end if;

  return new;
end;
$fn$;

drop trigger if exists validate_reading_passage_trg on public.reading_passages;
create trigger validate_reading_passage_trg
before insert or update on public.reading_passages
for each row execute function public.validate_reading_passage();