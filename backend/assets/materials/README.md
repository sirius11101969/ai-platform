# Production sales materials

This folder is intentionally committed without binary production files.

Manually upload the real production files on the server before enabling attachment sending:

- `presentation.pdf` — AS6 AI CRM Platform presentation.
- `demo.mp4` — product demo video.
- `screenshot-1.png` — first product screenshot.
- `screenshot-2.png` — second product screenshot.

Do **not** commit PDF, MP4, PNG, JPG, or other binary assets to Git. The API returns the clear Russian error message `Материал пока не загружен на сервер` when a requested material is missing.
