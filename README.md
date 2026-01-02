# Serenity

**A mobile app for stress relief, focus, and sleep through ASMR and ambient sounds.**

## Project idea
SerenitySound1 is a mobile application designed to help users relax, improve focus, or fall asleep more easily through calming audio experiences. The idea emerged from the need for a simple and accessible tool for mental recovery in a busy everyday life. The app offers:
- Playback of ambient and ASMR sounds for relaxation, focus, or sleep.
- Sleep or meditation timer.
- Favorites.
- Volume controls and play/pause functionality.

## Technical choices and justification

### Platform and framework
- **React Native with Expo**: Chose React Native for its flexibility and ability to build cross-platform apps for both iOS and Android. Expo simplifies the development process by providing tools for rapid prototyping, build automation, and easy integration with native APIs. This saves time and reduces the complexity of managing separate code bases for different platforms.

### State management
- **Zustand**: Used to manage global state, such as the user's favorite sounds and current sound combinations. Zustand was chosen for its simplicity, performance, and minimalistic API. It is easy to integrate and requires less boilerplate code compared to Redux, making it ideal for this project. Zustand makes it easy to manage and update state across the entire application without having to use `useContext` or `useReducer`. Zustand is used together with AsyncStorage to persist selected parts of the global state locally, improving user experience across app restarts.

### Database and authentication
- **Firebase Firestore & Firebase Authentication**: Used to store and manage user-related data such as profile information, favorites, and settings. Firestore enables secure CRUD operations scoped per authenticated user, while Firebase Authentication ensures that only authorized users can access and modify their data.
- **AsyncStorage**: Used as a complementary solution together with Zustand to persist local UI state and user preferences between app sessions on the same device.

### Audio Management
- **Expo AV**: Used to play and manage audio files. Expo AV is a powerful and simple audio management tool in React Native, supporting multiple audio channels, volume control, and synchronization. This allows for mixing multiple sounds simultaneously, which is a central feature of the app.

### Design and User Experience
- **Figma**: Used to create wireframes and prototypes. The design follows UX/UI principles and is responsive to different screen sizes. WCAG 2.1 standards have been followed to ensure accessibility.

## How the app works
The application allows users to browse sound categories, play and mix multiple ambient or ASMR sounds simultaneously, and control playback through a global player. Favorites are stored per authenticated user in Firestore and synchronized across sessions. Audio playback is handled using Expo AV, while global state such as playback status and UI state is managed with Zustand. Authentication and user data are securely handled through Firebase.


## Install dependencies:
   `npm install`

## How to run the project   
   `npx expo start`

## Environment variables
This project uses environment variables for sensitive configuration such as API keys.

To run the project locally, a `.env` file is required with the following variables:

EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_FREESOUND_API_KEY=
EXPO_PUBLIC_FREESOUND_BASE_URL=

The `.env` file is not included in the repository.


## Krav (Course requirements)

**Krav för godkänt:**

Planering och Research
- [x] Målgruppsanalys genomförd.
- [x] Backlog skapad och använd i projekthanteringsverktyg.

Design & Prototyping
- [x] Wireframes skapade i Figma
- [x] Interaktiv prototyp skapad i Figma
- [x] Responsiv design verifierad för minst två skärmstorlekar
- [x] WCAG 2.1 beaktad och testad i designfasen

Applikationsutveckling
- [x] Utvecklad i React Native med TypeScript och Expo
- [x] Databas och autentisering via Firebase
- [x] State-hantering implementerad med Zustand
- [x] WCAG 2.1 nivå A och AA implementerad i applikationskoden
- [x] Fungerar korrekt på mobil och surfplatta utan layoutfel
- [x] Git och GitHub används konsekvent
- [x] Dokumentation omfattar abstract, tech stack och arbetsprocess
- [x] Appen är hostad i Android EAS build men iOS-distribution krävde Apple Developer-konto
- [x] Inga kända blockerande tekniska fel vid inlämningstillfället, konsekvent design, och obruten navigation

**Krav för väl godkänt:**

Design och tillgänglighet
- [x] Interaktiv prototyp som nära motsvarar den färdiga produkten
- [x] Fullständig WCAG 2.1 nivå A och AA utan undantag
- [x] Kontrast, touch targets och interaktioner verifierade och dokumenterade

Teknisk Implementation
- [x] State management implementerad med Zustand
- [x] CRUD för användare via Firebase Auth
   - Create via registrering
   - Read via hämtning av användardata
   - Update via redigering av profil
   - Delete hanterat och dokumenterat
- [x] Återanvändning av komponenter

Kvalitet och process
- [x] Feature branches och pull requests används
- [x] Tydliga och konsekventa commit-meddelanden
- [x] Tillgänglighetsarbete uppdelat i separata commits
- [x] Användarupplevelse optimerad med tydlig feedback och laddningsindikatorer

Testning och dokumentation
- [x] Automatiserat flöde för bygge och deploy.
- [x] Tillgänglighet testad i Figma samt verifierad i implementation
- [x] WCAG-arbete dokumenterat i rapporten
- [x] Djupgående analys och reflektion över tekniska val
- [x] Motivering av arkitektur, state-hantering och tillgänglighet