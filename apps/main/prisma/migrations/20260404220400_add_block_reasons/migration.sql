-- Добавление причин блокировки
INSERT INTO "block_reason" (reason)
VALUES ('Bad behavior'),
       ('Advertising placement'),
       ('Another reason')
ON CONFLICT (reason) DO NOTHING;
