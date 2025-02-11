set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

default: watch

alias dev := watch

watch:
	bun run --bun scripts/watch.ts

build:
	bun run --bun scripts/build.ts
