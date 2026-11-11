# راهنمای استقرار رایگان سایت (Free Hosting Deployment Guide)

سایت به طور کامل آماده استقرار ابری و ۲۴ ساعته بر روی هاست‌های رایگان است. تنظیمات مربوط به `render.yaml` و `Dockerfile` و گیت در ریشه پروژه قرار داده شده‌اند.

---

### ۱. استقرار دائمی و رایگان روی Render.com (پیشنهادی - ۱۰۰٪ رایگان و دائمی)
Render یک سرویس بسیار قدرتمند و رایگان است که از Node.js و SQLite و آپلود فایل پشتیبانی می‌کند و یک دامنه HTTPS رایگان (مثلاً `https://obsolete-sector.onrender.com`) به شما می‌دهد:

1. پروژه را روی یک ریپازیتوری در اکانت **GitHub** خود قرار دهید:
   ```bash
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
2. وارد سایت [Render.com](https://render.com) شوید و با اکانت گیت‌هاب خود لاگین کنید.
3. روی **New +** و سپس **Web Service** کلیک کنید.
4. ریپازیتوری خود را انتخاب کنید.
5. تنظیمات زیر را تأیید کنید (به طور خودکار از `render.yaml` خوانده می‌شود):
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
6. دکمه **Create Web Service** را بزنید. پس از ۱ دقیقه سایت شما با آدرس عمومی فعال شده و برای دوستانتان قابل مشاهده خواهد بود!

---

### ۲. استقرار سریع روی Railway یا Koyeb
- وارد [Railway.app](https://railway.app) یا [Koyeb.com](https://koyeb.com) شوید.
- گزینه Deploy from GitHub Repo را بزنید.
- به صورت خودکار پروژه، پورت ۳۰۰۰ و دیتابیس SQLite را شناسایی کرده و مستقر می‌کند.
