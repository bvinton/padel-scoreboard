# Padel Scoring Logic & Rules

## Core Concept
Padel scoring is identical to tennis scoring. A match is generally played as a Best-of-3 Sets.

## Points System (Per Game)
- 0 points = "0"
- 1 point = "15"
- 2 points = "30"
- 3 points = "40"
- 4 points = "Game"

## Deuce & Advantage (Traditional)
- If both teams reach 40, the score is "Deuce".
- The next point won gives that team "Advantage" (Ad).
- If the team with Ad wins the next point, they win the Game.
- If the team without Ad wins the point, the score returns to "Deuce".

## Punto de Oro (Golden Point - Crucial Feature)
- A modern Padel variation. When the score reaches Deuce (40-40), the traditional Advantage rule is skipped. 
- The receiving team chooses which side to receive the serve on.
- The winner of this single "Golden Point" wins the game outright.
- **The app must support a toggle to use either Traditional Ad scoring OR Golden Point.**

## Game & Set System
- To win a Set, a team must win 6 Games with a margin of at least 2 Games (e.g., 6-4, 6-2).
- If the game score reaches 5-5, they play to 7 (e.g., 7-5).
- If the game score reaches 6-6, a Tiebreak is played.

## Tiebreak System
- Scored in regular integers (1, 2, 3, 4...).
- First team to 7 points, winning by a margin of 2 points, wins the Tiebreak and the Set (7-6).
- Serving alternates: Team A serves the 1st point. Team B serves points 2 and 3. Team A serves points 4 and 5, etc.

## Serving
- The app must track and display an indicator of which team is currently serving. Serve changes after every game.