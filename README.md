# SerenitySound1

**En mobilapp för stresslindring, fokus och sömn genom ASMR- och ambient-ljud.**

## Projektidé
SerenitySound1 är en app som hjälper användare att slappna av, få fokus eller somna lättare genom lugnande ljud. Idén uppstod ur behovet av ett enkelt, tillgängligt verktyg för mental återhämtning i en stressig vardag. Appen erbjuder:
- Blandning av flera ljud samtidigt (t.ex. regn + eld).
- Timer för sömn eller meditation.
- Favoriter för sparade ljudkombinationer.
- Volymkontroller och play/pause-funktioner.


## Technical choices and justification

### Platform and framework
- **React Native with Expo**: Chose React Native for its flexibility and ability to build cross-platform apps for both iOS and Android. Expo simplifies the development process by providing tools for rapid prototyping, build automation, and easy integration with native APIs. This saves time and reduces the complexity of managing separate code bases for different platforms.

### State management
- **Zustand**: Used to manage global state, such as the user's favorite sounds and current sound combinations. Zustand was chosen for its simplicity, performance, and minimalistic API. It is easy to integrate and requires less boilerplate code compared to Redux, making it ideal for this project. Zustand makes it easy to manage and update state across the entire application without having to use `useContext` or `useReducer`.

### Database and storage
- **AsyncStorage**: Used to store the user's favorite sounds and settings locally on the device. This choice was made because the app does not require a backend or user accounts, which simplifies development and increases user privacy. For future versions, Firebase or SQLite may be considered for more advanced features.

### Audio Management
- **Expo AV**: Used to play and manage audio files. Expo AV is a powerful and simple audio management tool in React Native, supporting multiple audio channels, volume control, and synchronization. This allows for mixing multiple sounds simultaneously, which is a central feature of the app.

### Design and User Experience
- **Figma**: Used to create wireframes and prototypes. The design follows UX/UI principles and is responsive to different screen sizes. WCAG 2.1 standards have been followed to ensure accessibility.

## Install dependencies:
   `npm install`

## How to run the project   
   `npm expo start`

## Krav

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
- [x] State-hantering implementerad med Zustand.
- [x] WCAG 2.1 nivå A och AA implementerad i applikationskoden
- [x] Responsiv för mobil och padda.
- [x] Git och GitHub används konsekvent.
- [x] Dokumentation omfattar abstract, tech stack och arbetsprocess

- [x] Appen är hostad i Android EAS build men iOS-distribution krävde Apple Developer-konto.
- [?!] Fri från tekniska fel, konsekvent design, och obruten navigation.

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
- [ ] Fullt responsiv inom mobil och surfplatta spannet

Kvalitet och process
- [x] Feature branches och pull requests används
- [x] Tydliga och konsekventa commit-meddelanden
- [x] Tillgänglighetsarbete uppdelat i separata commits ?
- [x] Användarupplevelse optimerad med tydlig feedback och laddningsindikatorer ?

Testning och dokumentation
- [ ] Automatiserat flöde för bygge och deploy.
- [ ] Tillgänglighet testad i Figma samt verifierad i implementation
- [ ] WCAG-arbete dokumenterat i rapporten
- [ ] Djupgående analys och reflektion över tekniska val
- [ ] Motivering av arkitektur, state-hantering och tillgänglighet  ?