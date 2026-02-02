@echo off
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flowstate
call npx tsx server/index.ts
pause
