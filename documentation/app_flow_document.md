# Ibadah Tracker App Flow Document

## Onboarding and Sign-In/Sign-Up

When a new user first arrives at the Ibadah Tracker, they land on a welcoming page built with an animated hero component. This page briefly explains the benefit of tracking daily worship activities and invites the user to either sign up or sign in. To create a new account, the user clicks "Sign Up" and fills out a simple form asking for their email, a password, and an optional display name. The form uses React Hook Form and Zod to ensure the email is valid and the password meets our security rules. Once the user submits the form, the data is sent to Supabase Auth, which verifies the information and sends a confirmation email. After email verification, the user can sign in using the same email and password form. If the user forgets their password, they click a "Forgot Password" link, enter their email, and receive a reset link via email. Clicking the link takes them to a secure reset page where they choose a new password. Signing out is available from any page by clicking the user avatar in the header and selecting "Log Out," which clears the session and returns the user to the landing page.

## Main Dashboard or Home Page

Once signed in, the user lands on the main dashboard that greets them by name. The header at the top shows the app logo, a theme toggle for light and dark mode, and the user avatar. A collapsible sidebar on the left lists navigation items: Dashboard, Log Activity, History, Quran Tracker, Fasting Calendar, and Profile. The main area of the dashboard displays cards summarizing today’s prayers, a progress bar for Quran reading goals, and a quick snapshot of fasting status. There is also a calendar widget that highlights days with logged activities. The user can click any card or the calendar to jump straight to the relevant detailed page.

## Detailed Feature Flows and Page Transitions

### Logging a New Worship Activity

When the user clicks the "Log Activity" option in the sidebar or the prominent button on the dashboard, a modal sheet slides up using Framer Motion. Inside, they choose the activity type: Salat, Quran, or Sawm. If they select Salat, a form asks for the prayer time, the number of rakats, and any notes. If they select Quran, they enter the pages read or verses memorized. If they select Sawm, they log the date and any optional notes. The form validates entries in real time and disables the save button until everything is valid. When they hit "Save," TanStack Query runs a mutation that sends the new entry to Supabase, updates the dashboard cards immediately, and closes the modal with a success toast. If the network is slow, the UI shows a loading spinner until the operation finishes.

### Viewing Prayer History

Selecting "History" from the sidebar loads a page with a date selector at the top. The default view shows the last seven days of prayer entries in a scrollable list. Each list item is a card with the date, prayer details, and a status icon. Clicking any card expands it inline to show full details or to edit the entry. Editing reuses the same form component, prefilled with existing data. After saving edits, the list refreshes itself automatically.

### Tracking Quran Reading

Clicking "Quran Tracker" from the sidebar opens a page with a visual representation of the user’s reading goal. A progress circle shows the overall completion for a user-set target. Below that, there is a log of reading entries similar to the prayer history. Users can add new entries by clicking "Add Reading," which brings up the same modal used in the Log Activity flow. When they save, the progress circle animates to reflect the new total.

### Fasting Calendar

The "Fasting Calendar" link leads to a calendar view for the current month. Each day is colored based on whether the user fasted. Days without entries can be clicked to add a new Sawm record. Days with an existing record can be clicked to view or edit details. Changing months automatically fetches the records for that month via TanStack Query and updates the calendar.

## Settings and Account Management

From any page, the user clicks the avatar in the header and chooses "Profile." The Profile page shows their display name, email, and an avatar placeholder. They can edit their display name or upload an avatar, then click "Save Changes" to update their profile in Supabase. Below that, there is a "Preferences" section where they toggle dark mode, set daily reminder times for prayer logs, and choose notification types. Clicking "Update Preferences" saves these settings locally and to the database. To change their password, the user selects "Change Password" and enters the current and new passwords in a form. After submitting, Supabase validates the current password and, if valid, updates it. After any updates, the user can click "Back to Dashboard" to return to the home screen.

## Error States and Alternate Paths

If the user enters invalid data in any form, inline validation messages appear in red, explaining the issue. If the network connection drops while saving an entry, the app shows a full-screen offline banner and queues the mutation. Once the connection returns, the queued entry automatically syncs. If Supabase returns an authentication error, such as a session timeout, the user is redirected to the sign-in page with a message asking them to log in again. Attempting to access protected routes without logging in also sends the user back to the landing page. In all cases, the app provides clear on-screen messages and uses the Toast component to keep the user informed and help them recover gracefully.

## Conclusion and Overall App Journey

A new user discovers the Ibadah Tracker and completes a quick sign-up process. Upon signing in, they see a dashboard that shows summarized progress and easy navigation to all core features. They can log new worship activities through a guided form, view and edit historical entries, track Quran reading progress, and manage fasting records on a monthly calendar. Account settings allow them to personalize their experience with themes and reminders. Throughout the journey, error messages and offline handling keep the flow smooth. The typical end goal is for users to maintain a consistent record of their Ibadah activities, review their progress over time, and stay motivated to grow in their worship practice every day.