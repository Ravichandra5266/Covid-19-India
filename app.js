const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error :${erroe}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//dbResponsibleObject
const dbResponsibleObject = (eachItem) => {
  return {
    stateId: eachItem.state_id,
    stateName: eachItem.state_name,
    population: eachItem.population,
  };
};

//Get States List
app.get("/states/", async (request, response) => {
  const getStatesList = `SELECT * FROM state`;
  const dbResponse = await db.all(getStatesList);
  response.send(dbResponse.map((each) => dbResponsibleObject(each)));
});

//Get State
app.get("/states/:stateId/", async (require, response) => {
  const { stateId } = require.params;
  const getState = `SELECT * FROM state WHERE state_id = ${stateId}`;
  const dbResponse = await db.get(getState);
  response.send(dbResponsibleObject(dbResponse));
});

//Add District
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const addDistrict = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
  VALUES("${districtName}", ${stateId}, ${cases}, ${cured}, ${active}, ${deaths})`;
  const dbResponse = await db.run(addDistrict);
  response.send("District Successfully Added");
});

//Get District
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `SELECT * FROM district WHERE district_id = ${districtId}`;
  const dbResponse = await db.get(getDistrict);
  response.send(dbResponse);
});

//Delete District
app.delete("/districts/:districtId/", async (require, response) => {
  const { districtId } = require.params;
  const deleteDistrict = `DELETE FROM district WHERE district_id = ${districtId}`;
  const dbResponse = await db.run(deleteDistrict);
  response.send("District Removed");
});

//Update District
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrict = `UPDATE district 
    SET district_name = "${districtName}",state_id = ${stateId},cases = ${cases},
    cured = ${cured},active = ${active},deaths = ${deaths}
    WHERE district_id = ${districtId}`;
  const dbResponse = await db.run(updateDistrict);
  response.send("District Details Updated");
});

//Get Responsive Report
const stateReport = (each) => {
  return {
    totalCases: each.cases,
    totalCured: each.cured,
    totalActive: each.active,
    totalDeaths: each.deaths,
  };
};

//Get State
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateReport = `SELECT cases,cured,active,deaths FROM district WHERE state_id = ${stateId}`;
  const dbResponse = await db.get(getStateReport);
  response.send(stateReport(dbResponse));
});

//Get District of state
app.get("/districts/:districtId/details/", async (request, response) => {
  const { stateId } = request.params;
  const getStateDetails = `SELECT state_name as stateName FROM state`;
  const dbResponse = await db.get(getStateDetails);
  response.send(dbResponse);
});

//Export
module.exports = app;
