# AS6 Diagnostic Backup Discovery Policy

Rule:

Diagnostic backup files must never be stored inside diagnostic discovery paths.

Required behavior:

- Do not keep *.backup.* diagnostic files in ops/bin.
- Store diagnostic backups under ops/backups/diagnostics/.
- Diagnostic registration must ignore backup files.
- Backup files are not diagnostics and must not require registry or coverage entries.
