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

- [x] Målgruppsanalys.
- [x] Backlog i projekthanteringsverktyg.

Design & Prototyping
- [x] Wireframes i Figma
- [x] Prototyp skapad i Figma
- [x] Responsiv design för minst två skärmstorlekar
- [x] Följer WCAG 2.1-standarder

Applikationsutveckling
- [x] Utvecklad med [React Native/Expo] 
- [x] Databas: [Firebase] 
- [x] State-hantering implementerad.
- [ ] Semantisk HTML och WCAG 2.1-standarder följda.
- [x] Responsiv design för mobil och padda.
- [x] Git och GitHub används för versionshantering.
- [x] 2-3 sidor med abstract, tech stack, och dokumentation av arbetsprocess.
- [x] Appen är hostat.
- [ ] Fri från tekniska fel, konsekvent design, och obruten navigation.

**Krav för väl godkänt:**
- [x] Interaktiv prototyp som liknar den färdiga produkten.
- [x] Fullständig WCAG 2.1-nivå A och AA.
- [x] State management: [Zustand]
- [ ] CRUD med säker autentisering [Firebase Auth]
- [ ] Fullt responsiv för alla skärmstorlekar.
- [ ] Optimering: Återanvänd kod & komponenter.
- [ ] Testad med WebAIM WAVE utan fel
- [x] Feature branches och pull requests används.
- [x] Tydliga commit-meddelanden.
- [ ] Automatiserat flöde för bygge och deploy.
- [ ] 3-6 sidor med djupgående analys, reflektion, och motivering av tekniska val.
- [ ] Optimerad användarupplevelse med minimala laddningstider och tydlig återkoppling.