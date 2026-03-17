#!/usr/bin/env bun

import { Command } from "commander"

import cliPackage from "../package.json"
import {
  ApiClientError,
  createApiClient,
  DEFAULT_DISCOVERY_SOURCE,
} from "./client"
import { runAdd } from "./commands/add"
import { runCheck } from "./commands/check"
import { parseRecentLimit, runRecent } from "./commands/recent"
import { runStatus } from "./commands/status"
import { writeError } from "./output"

import type { ApiClient } from "./client"
import type { OutputWriter } from "./output"

type GlobalOptions = Readonly<{
  apiUrl?: string
  json?: boolean
}>

export type CliRuntime = Readonly<{
  api: ApiClient
  options: GlobalOptions
  stdout: OutputWriter
  stderr: OutputWriter
}>

type ProgramOptions = Readonly<{
  apiFactory?: (apiUrl?: string) => ApiClient
  stdout?: OutputWriter
  stderr?: OutputWriter
}>

function createRuntime(command: Command, options: ProgramOptions): CliRuntime {
  const globalOptions = command.optsWithGlobals<GlobalOptions>()

  return {
    api: (options.apiFactory ?? createApiClient)(globalOptions.apiUrl),
    options: globalOptions,
    stdout: options.stdout ?? ((message) => process.stdout.write(message)),
    stderr: options.stderr ?? ((message) => process.stderr.write(message)),
  }
}

export function createProgram(options: ProgramOptions = {}) {
  const program = new Command()
    .name("discover-word")
    .description("Interact with the Discover Word API from the terminal.")
    .version(cliPackage.version)
    .option("--api-url <url>", "Base URL for the Discover Word API")
    .option("--json", "Print raw JSON responses")
    .showHelpAfterError()

  program
    .command("status")
    .description("Show API service metadata")
    .action(async function () {
      await runStatus(createRuntime(this, options))
    })

  program
    .command("recent")
    .description("List recent discoveries")
    .option(
      "-n, --limit <number>",
      "Limit the number of results",
      parseRecentLimit
    )
    .action(async function (commandOptions: { limit?: number }) {
      await runRecent(createRuntime(this, options), commandOptions.limit)
    })

  program
    .command("check")
    .description("Check whether a term already exists")
    .argument("<term>", "Word or phrase to look up")
    .action(async function (term: string) {
      await runCheck(createRuntime(this, options), term)
    })

  program
    .command("add")
    .description("Add a new discovery")
    .argument("<term>", "Word or phrase to submit")
    .option(
      "-s, --source <source>",
      "Discovery source label",
      DEFAULT_DISCOVERY_SOURCE
    )
    .action(async function (term: string, commandOptions: { source: string }) {
      await runAdd(createRuntime(this, options), term, commandOptions.source)
    })

  return program
}

export async function run(argv: string[], options: ProgramOptions = {}) {
  const program = createProgram(options)

  try {
    await program.parseAsync(argv, { from: "user" })
  } catch (error) {
    const stderr =
      options.stderr ?? ((message: string) => process.stderr.write(message))

    if (error instanceof ApiClientError) {
      writeError(stderr, error.message)
      return 1
    }

    if (error instanceof Error) {
      writeError(stderr, error.message)
      return 1
    }

    writeError(stderr, "Unknown CLI failure.")
    return 1
  }

  return 0
}

const isMainModule = import.meta.main

if (isMainModule) {
  const exitCode = await run(process.argv.slice(2))
  process.exit(exitCode)
}
