# Teacher Nelly's Young Learners Academy — Production Package

This is a **new, standalone academy website**. It does not connect to the previous academy websites.

## What is included
- Responsive public academy website
- Expanded Early Years, Basic, JSS and SSS curriculum catalogue
- A–Z phonics board with child-friendly browser speech
- Detailed lesson view with learning goals, explanations, examples, practice and challenge
- Premium lesson labels and parent-email access checks
- Google AdSense site code and parent-oriented ad placement area
- Colours & shapes learning
- Practice Hub with instant feedback
- 15 interactive educational games
- 100 original WAEC/NECO-style practice questions across 10 subjects
- Learner registration
- Parent inquiry/tutoring form
- Parent class-access lookup
- Premium plans
- Paystack server-side payment initialization + verification
- Paystack webhook with signature verification
- Private admin dashboard
- Supabase Auth admin login
- Server-side admin authorization using `ADMIN_EMAIL`
- Server-side database access using a Supabase secret key
- VIP code generation
- Netlify Functions

## Important security design
The Paystack secret key is never placed in the browser. Paystack's documentation says secret keys must not be used in frontend code; initialization and verification belong on the backend. This package follows that pattern.

The admin page is not linked from the public navigation, but hiding a URL is not security. The actual protection is Supabase Auth plus server-side email authorization and a server-only Supabase secret.

## One-time setup

### 1. Create a NEW Supabase project
Create a fresh Supabase project for this standalone academy.

Open SQL Editor and run:
`supabase/schema.sql`

Then go to Authentication > Users and create your private admin user with email/password.

### 2. Netlify
Create a **new Netlify site** and deploy this ZIP.

In Netlify → Site configuration → Environment variables, add:

SUPABASE_URL = your new Supabase project URL
SUPABASE_PUBLISHABLE_KEY = your Supabase sb_publishable_... key
SUPABASE_SECRET_KEY = your Supabase sb_secret_... key
ADMIN_EMAIL = the exact admin email you created in Supabase
PAYSTACK_SECRET_KEY = your Paystack secret key
SITE_URL = https://YOUR-NEW-NETLIFY-SITE.netlify.app

Do NOT put the Supabase service/secret key or Paystack secret key in any HTML, JS, GitHub repository, or ZIP you publish.

### 3. Paystack
In Paystack Dashboard, configure the webhook URL to:

https://YOUR-NEW-NETLIFY-SITE.netlify.app/.netlify/functions/paystack-webhook

Use your Paystack live secret key only when you are ready for live payments.

The payment flow is:
1. Browser asks Netlify Function to initialize payment.
2. Netlify Function calls Paystack using the secret key.
3. Customer pays on Paystack.
4. Paystack sends a signed webhook.
5. The webhook is verified and the payment is recorded.
6. The callback page can also verify the reference as a fallback.

### 4. Admin
Open:
https://YOUR-NEW-NETLIFY-SITE.netlify.app/admin

Sign in with the Supabase Auth user whose email matches `ADMIN_EMAIL`.

There is no public admin link on the academy home page.

## What this package does not do
It cannot create your Supabase/Paystack/Netlify accounts or know your private keys. Those values must remain in your own dashboards.

## Recommended production hardening before advertising widely
- Academy page icon is included as `academy-icon.jpg`; replace it with a higher-resolution brand asset later if desired.
- Replace the sample curriculum lesson descriptions with your authored lesson content.
- Add your real Paystack live plans/amounts.
- Test registration, inquiry, payment, webhook and admin login in a Netlify deploy.
- Configure a custom domain and HTTPS.
- Add a privacy notice and terms suitable for your academy.
- Consider adding email notifications for registrations/inquiries.


## Curriculum and Premium lessons
The curriculum catalogue covers Pre-Nursery, Nursery 1–2, Basic 1–6, JSS 1–3 and SSS 1–3. Lesson views now provide a structured child-friendly explanation, examples, practice and challenge instead of the previous one-line placeholder. Some lessons are marked Premium, while foundational early-years material remains free.

The browser can read lessons aloud using the device's available speech voice. Voice choice varies by device/browser; the site requests a softer/slower voice when one is available.

## Google AdSense
The public site includes the AdSense script for publisher `ca-pub-7880058174479121` and a parent-oriented ad placement area. AdSense approval is not automatic: Google requires original, useful content and policy compliance. Revenue is not guaranteed simply because someone opens the site or because a visitor clicks; traffic and ad interactions must be genuine. Never ask children or users to click ads and never click your own ads.

The academy should keep advertising primarily around parent-facing/support content rather than interrupting children's learning activities. Review Google's current publisher policies before submitting the site.


## Curriculum and Premium lessons
The curriculum catalogue covers Pre-Nursery, Nursery 1–2, Basic 1–6, JSS 1–3 and SSS 1–3. Lesson views now provide a structured child-friendly explanation, examples, practice and challenge instead of the previous one-line placeholder. Some lessons are marked Premium, while foundational early-years material remains free.

The browser can read lessons aloud using the device's available speech voice. Voice choice varies by device/browser; the site requests a softer/slower voice when one is available.

## Google AdSense
The public site includes the AdSense script for publisher `ca-pub-7880058174479121` and a parent-oriented ad placement area. AdSense approval is not automatic: Google requires original, useful content and policy compliance. Revenue is not guaranteed simply because someone opens the site or because a visitor clicks; traffic and ad interactions must be genuine. Never ask children or users to click ads and never click your own ads.

The academy should keep advertising primarily around parent-facing/support content rather than interrupting children's learning activities. Review Google's current publisher policies before submitting the site.


## Content note
The exam bank contains original practice questions written for Teacher Nelly's Academy. They are not official WAEC/NECO questions and are not leaked examination materials. The subject coverage is informed by current WAEC Nigeria subject information and the 2026 WASSCE timetable.

## Curriculum update
The academy curriculum is presented as five learner groups rather than separate Basic/JSS/SS class buttons: Preschool, Nursery, Basic, JSS and SSS. The supplied topic explanations are available as lesson cards. Basic, JSS and SSS subjects each contain exactly two marked Premium topics; Preschool and Nursery remain free.

The site also includes a separate Classroom Tests & Quizzes section with assessments for Pre-Nursery, Nursery, Basic, JSS and SSS.


## Monetag
- `sw.js` is installed in the website root for Monetag HTTPS verification/service-worker functionality.
- Monetag zone: `11912099`
- Monetag domain: `3nbf4.com`
- Do not remove `sw.js` after verification.

## Google AdSense
- Publisher: `ca-pub-7880058174479121`
- Parent ad slot: `6799546282`
- `ads.txt` is included with the required publisher entry.

## Academy APK popup
- The APK popup is included and links to the official GitHub Release APK: `https://github.com/akajenelly1/Teacher-Nelly-academy-/releases/download/v1.0.0/teacher.Nelly.young.apk`.
- Upload the actual APK using that exact filename to activate the popup without changing the code.
