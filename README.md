# Historical Daily Challenge Leaderboard

This app is basically just a manual playlists manager. Except the fact that you can only add inactive daily challenge playlists

## Prerequisites

Install [Git](https://git-scm.com/downloads) and [Nodejs](https://nodejs.org/en/download) (v22 LTS)

### Installation Notes (Nodejs)
- **Windows:** The easiest way to run Nodejs on Windows is by downloading the "Windows Installer". Scroll down to see that option. 
- **macOS/Linux:** nvm is recommended.

## Getting started
0. Open the terminal
1. Clone this repo:<br>
`git clone https://github.com/sukunnari/historical-daily-challenge-leaderboards.git`
2. Go to the newly created folder:<br>
`cd historical-daily-challenge-leaderboards`
3. Install the dependencies:<br>
`npm i`
4. Copy the **".env.sample"** file to **".env"**, then follow the instructions to fill in the empty variables
5. Initialise the database table:<br>
`npm run db:migrate`
6. Build the app:<br>
`npm run build`
7. Run the app:<br>
`npm run start`

## Adding a daily challenge leaderboard
1. You have to find out the room id of a daily challenge
  - The easiest way is by checking the playlists/multiplayer history of a participating player.
2. Go to `/manage` to add the room.
3. Enter the password
4. Add the room 
5. If it succeeds, you can now retrieve the scores