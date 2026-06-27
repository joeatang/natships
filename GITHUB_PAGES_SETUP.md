# NATSHIPS GitHub Pages Setup (Free URL)

This repo is ready to publish as a static site using GitHub Pages.

## 1. Create or connect a GitHub repo

If you do not already have a GitHub remote, create one on GitHub named natships, then run:

```sh
cd /Users/joeatang/Documents/GitHub/natships
git init
git add .
git commit -m "NATSHIPS live experience + Pages setup"
git branch -M main
git remote add origin https://github.com/<your-username>/natships.git
git push -u origin main
```

If your branch is already master, pushing master also works with the workflow.

## 2. Enable Pages in GitHub

On GitHub:
1. Open repo Settings.
2. Open Pages.
3. Under Build and deployment, set Source to GitHub Actions.

The workflow file is already included at .github/workflows/pages.yml.

## 3. Get your free public URL

After the workflow finishes, your site URL will be:

```text
https://<your-username>.github.io/natships/
```

The live landing page is index.html and points users to the black-box experience.

## 4. Optional: user-site URL instead of project-site URL

If you want the root URL format:

```text
https://<your-username>.github.io/
```

Rename the repository to <your-username>.github.io and keep index.html at repo root.