flowchart TD
  Start[App Launch]
  Start --> AuthCheck{User Logged In}
  AuthCheck -->|No| Login[Display Login Screen]
  AuthCheck -->|Yes| Dashboard[Display Dashboard]
  Login --> AuthAction{Login Submitted}
  AuthAction -->|Success| Dashboard
  AuthAction -->|Failure| Login
  Dashboard --> SelectAction{Choose Ibadah Activity}
  SelectAction -->|Salat| SalatForm[Show Salat Form]
  SelectAction -->|Quran| QuranForm[Show Quran Reading Form]
  SelectAction -->|Sawm| SawmForm[Show Fasting Tracker]
  SelectAction -->|Charity| CharityForm[Show Charity Form]
  SalatForm --> SubmitSalat{Submit Form}
  SubmitSalat -->|Yes| UpdateData[Save Entry to Supabase]
  SubmitSalat -->|No| SalatForm
  QuranForm --> SubmitQuran{Submit Form}
  SubmitQuran -->|Yes| UpdateData
  SubmitQuran -->|No| QuranForm
  SawmForm --> SubmitSawm{Submit Form}
  SubmitSawm -->|Yes| UpdateData
  SubmitSawm -->|No| SawmForm
  CharityForm --> SubmitCharity{Submit Form}
  SubmitCharity -->|Yes| UpdateData
  SubmitCharity -->|No| CharityForm
  UpdateData --> Dashboard
  Dashboard --> History[View History]
  Dashboard --> Profile[View Profile]
  Dashboard --> Settings[Open Settings]
  Settings --> ThemeChange[Change Theme]
  ThemeChange --> Dashboard