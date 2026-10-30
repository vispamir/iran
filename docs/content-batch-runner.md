# Content batch runner

Run from the project root with Python 3 and an authenticated `codex` executable on PATH. The runner uses the existing CLI model configuration unless `--model` is supplied. It does not install Codex, change authentication, or schedule recurring jobs.

```sh
# Preview the next pending batch without changing files
python3 scripts/run-content-batches.py --dry-run

# Run the next pending batch
python3 scripts/run-content-batches.py

# Select a specific batch (repeat --batch for multiple batches)
python3 scripts/run-content-batches.py --batch batch-0001

# Run a bounded number or all pending/blocked/interrupted batches sequentially
python3 scripts/run-content-batches.py --all --limit 5
python3 scripts/run-content-batches.py --all

# Retry a failed, interrupted, or incomplete research batch
python3 scripts/run-content-batches.py --batch batch-0001 --retry
```

Each selected batch launches a separate `codex exec` process. The CLI receives the editorial rules from `docs/content-generation-prompt.md`, the schedule cutoff, exact batch IDs, and a compact manifest containing the selected pages, ancestors, children, and siblings. The full schedule manifest validates output paths. No image inventory is assumed approved. Live web search is requested via `web_search="live"`; if unavailable, the prompt requires `needs_research` rather than invented verification.

The CLI runs in the read-only sandbox; the parent runner writes logs and state. It uses `--skip-git-repo-check` because this workspace need not be a Git checkout. Local configuration, network restrictions, and tool availability still apply. See [official OpenAI documentation on non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode).

## Tracking and output

The schedule moves through `researching` and `validating`, then each term takes the output's `ready_for_review` or `needs_research` state. Failures, timeouts, and handled interruptions set the batch and its terms to `blocked`, retaining the error. Execution/validation failures are retried automatically (three retries after the initial attempt by default), with exponential delays of 30, 60, and 120 seconds. After exhaustion the batch remains blocked and later selected batches continue. Use `--fail-fast` to stop after exhaustion. Valid `needs_research` output is retained without automatic regeneration. It never automatically sets `complete`, which requires editorial review.

Successful attempts record `source_count` and `output_file` on each term. `updated_at`, summary counts, batch output, and attempt metadata are saved atomically. Attempts are retained under `content/batches/<batch-id>/<timestamp>-<unique-id>/`:

- `prompt.md`: exact supplied instructions and input manifest.
- `stdout.log` and `stderr.log`: CLI output and diagnostics.
- `response.json`: unmodified final CLI message, including invalid output when available.
- `pages.json`: parsed, structurally validated page array, written only on success.

A single operating-system lock prevents overlapping runner processes for the same schedule. A leftover `.lock` file is harmless; the lock releases when the runner exits. After an uncatchable termination, active states may remain; inspect the logs and retry the specific batch with `--retry`. Do not modify the schedule concurrently by hand.

`--all` selects pending, blocked, and interrupted active batches, recovering previous crashes after acquiring the schedule lock. Ready, complete, and successfully generated needs_research batches are skipped. With explicit `--batch`, use `--retry` for blocked, interrupted, or needs_research batches. A mixed `needs_research` batch can regenerate its ready pages on retry; prior attempt files remain available. A fully ready batch or any batch containing a `complete` term cannot be rerun by this script.

Recovery options: `--max-retries 3`, `--retry-delay 30`, `--retry-max-delay 300`, and `--fail-fast`. Retry counts reset per invocation; each invocation processes its selected batches once with bounded retries. Validation errors are included in the next attempt’s prompt. Each batch records `attempt_history`, `retry_count`, and `next_retry_at`. Every attempt retains separate files. The process returns nonzero if any selected batch exhausts its retries, even if later batches succeed. Ctrl-C and SIGTERM stop execution without retrying; the runner does not restart itself after a machine reboot or external termination. Missing executables/authentication and other persistent errors can still exhaust the retry budget; inspect logs rather than expecting retries to fix configuration.

Other options: `--schedule FILE`, `--prompt FILE`, `--output-dir DIR`, `--codex EXECUTABLE`, `--model MODEL`, and `--timeout SECONDS` (default 3600 per batch). Defaults resolve from the project root; supplied relative paths resolve from the caller's current directory. The schedule's `as_of_date` is retained, not silently advanced.

## Validation limits

The runner checks exact page coverage, identity, top-level fields, timestamps, editorial states, duplicate IDs, source references, dataset/chart references, numerical observation status, basic Mermaid fences, and known related paths. It does not prove factual accuracy, actual source inspection, publication rights, English quality, Mermaid rendering, or full conformance of every nested field. Human editorial and evidence review remains required before `complete` or publication. Valid output is stored separately; this script does not integrate it into the website.

Run the offline tests without consuming model usage:

```sh
python3 -m unittest discover -s tests -p 'test_content_runner.py' -v
```
