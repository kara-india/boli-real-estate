---
description: Update GitHub repository with latest changes
---

// turbo-all
1. Add all changes
```powershell
git add .
```

2. Commit changes with a timestamped message
```powershell
git commit -m "Auto-update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
```

3. Push to the main branch
```powershell
git push origin main
```
