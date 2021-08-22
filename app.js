"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const { Datastore } = require("@google-cloud/datastore");

const datastore = new Datastore();

const app = express();

app.use(bodyParser.json());

function recursionValidate(data, i) {
  if (i > 0) {
    if (!/^[ATCG]+$/.test(data[i - 1])) {
      return false;
    }
    return recursionValidate(data, i - 1);
  } else {
    return true;
  }
}

function recursionMain(data, i) {
  if (i > 2) {
    let count = 0;
    count = count + recursionHorizontal(data, i, data.length - 1);
    count = count + recursionVertical(data, i, data.length - 1);
    count = count + recursionOblique(data, i, data.length - 1);
    return count + recursionMain(data, i - 1);
  } else {
    return 0;
  }
}

function recursionHorizontal(data, i, j) {
  if (j > 2) {
    if (
      data[i][j] === data[i][j - 1] &&
      data[i][j] === data[i][j - 2] &&
      data[i][j] === data[i][j - 3]
    ) {
      console.log(
        `recursionHorizontal---> ${data[i][j]}${data[i][j - 1]}${
          data[i][j - 2]
        }${data[i][j - 3]}`
      );
      return 1 + recursionHorizontal(data, i, j - 1);
    }
    return recursionHorizontal(data, i, j - 1);
  } else {
    return 0;
  }
}

function recursionVertical(data, i, j) {
  if (j > 2) {
    if (
      data[j][i] === data[j - 1][i] &&
      data[j][i] === data[j - 2][i] &&
      data[j][i] === data[j - 3][i]
    ) {
      console.log(
        `recursionVertical---> ${data[j][i]}${data[j - 1][i]}${data[j - 2][i]}${
          data[j - 3][i]
        }`
      );
      return 1 + recursionVertical(data, i, j - 1);
    }
    return recursionVertical(data, i, j - 1);
  } else {
    return 0;
  }
}

function recursionOblique(data, i, j) {
  if (j > 2) {
    if (
      data[j][i] === data[j - 1][i - 1] &&
      data[j][i] === data[j - 2][i - 2] &&
      data[j][i] === data[j - 3][i - 3]
    ) {
      console.log(
        `recursionOblique---> ${data[j][i]}${data[j - 1][i - 1]}${
          data[j - 2][i - 2]
        }${data[j - 3][i - 3]}`
      );
      return 1 + recursionOblique(data, i, j - 1);
    }
    return recursionOblique(data, i, j - 1);
  } else {
    return 0;
  }
}

const insertFraud = (fraud) => {
  return datastore.save({
    key: datastore.key("fraud"),
    data: fraud,
  });
};

const getFraud = (id) => {
  const query = datastore
    .createQuery("fraud")
    .filter("transaction_id", id)
    .limit(1);

  return datastore.runQuery(query);
};

const getFrauds = (page, size) => {
  const query = datastore
    .createQuery("fraud")
    .order("transaction_id")
    .offset(page * size)
    .limit(size);

  return datastore.runQuery(query);
};

const getFraudsByStatus = (isFraud) => {
  const query = datastore.createQuery("fraud").filter("isFraud", isFraud);
  return datastore.runQuery(query);
};

app.get("/", (req, res) => {
  console.log("Servicio arriba!");

  res.status(200).send("Servicio arriba!").end();
});

app.post("/frauds", async (req, res) => {
  const { data, transaction_id } = req.body;
  const response = { result: false };
  if (data.length > 2 && data.length === data[0].length) {
    if (recursionValidate(data, data.length)) {
      const count = recursionMain(data, data.length - 1);
      console.log("count", count);
      if (count > 1) {
        response.result = true;
      }
    } else {
      console.log("Valor invalido");
    }
  } else {
    console.log("Matriz sin estructura valida");
  }
  if (response.result) {
    await insertFraud({ data, transaction_id, isFraud: true });
    res.status(200).send(response).end();
  } else {
    await insertFraud({ data, transaction_id, isFraud: false });
    res.status(403).send("Error").end();
  }
});

app.get("/frauds/:id", async (req, res) => {
  const [entities] = await getFraud(req.params.id);
  res.status(200).send(entities).end();
});

app.get("/frauds", async (req, res) => {
  const [entities] = await getFrauds(req.query.page, req.query.size);
  res.status(200).send(entities).end();
});

app.get("/stats", async (req, res) => {
  const [frauds] = await getFraudsByStatus(true);
  const [notFrauds] = await getFraudsByStatus(false);
  const fraudCount = frauds.length;
  const notFraudCount = notFrauds.length;

  res
    .status(200)
    .send({
      count_fraud: fraudCount,
      count_not_fraud: notFraudCount,
      ratio: notFraudCount > 0 ? fraudCount / notFraudCount : 0,
    })
    .end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});

module.exports = app;
