const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

intializeDBAndServer();

let convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersy_number,
    role: dbObject.role,
  };
};

// GET all players API 1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team; `;
  let playersArray = await db.all(getPlayersQuery);

  response.send(
    playersArray.map((num) => convertDbObjectToResponseObject(num))
  );
});

// Add a player to the DataBase API 2

app.post("/players/", async (request, response) => {
  try {
    const aboutPlayer = request.body;
    const { playerName, jerseyNumber, role } = aboutPlayer;
    const updatePlayerQuery = `INSERT INTO
      cricket_team (player_name, jersey_number,role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         '${role}'
         );`;
    const dbResponse = await db.run(updatePlayerQuery);
    //const playerID = dbResponse.lastID;
    response.send("Player Added to Team");
  } catch (e) {
    console.log(`Error DB: ${e.message}`);
    process.exit(1);
  }
});

//API 3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id =${playerId}`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//API 4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
    player_name= '${playerName}',
    jersey_number= '${jerseyNumber}',
    role = '${role}'
    WHERE player_id = '${playerId}' ;`;
  const dbResponse = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE  FROM cricket_team WHERE player_id=${playerId};`;
  const dbResponse = await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
