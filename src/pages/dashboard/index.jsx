import React from "react";
import { Badge, Col, Row } from "react-bootstrap";
import "../dashboard/index.style.css";
import MenuOptionsComponents from "../shared/menu.options";
import { Chart } from "react-google-charts";
import { useState, useEffect } from "react";
import Api from "../../utils/axios";
import { compareDate } from "../../utils/compareDate";
import Countdown, { zeroPad } from "react-countdown";
import ReactLoading from "react-loading";
import Loading from "react-loading";
import { useNavigate } from "react-router-dom";
import TableFiltered from "../components/Filter/filter";

export default function DashboardCompnent() {
  const [data, setData] = useState();
  const [logList, setLogList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chart, setChart] = useState(true);
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState();
  const [loadingRefresh, setLoadingRefresh] = useState(false)

  
  const qtdLogWithError = logList.filter(
    (log) => log?.status_connection == 500
  ).length;

  const qtdLogSuccess = logList.filter(
    (log) =>
      log?.status_connection == 200 &&
      compareDate(
        JSON.parse(log?.description)?.currentDateLocal,
        JSON.parse(log?.description)?.currentDateCustomer
      )
  ).length;

  const qtdLogWithWarning = logList.filter(
    (log) =>
      log?.status_connection == 200 &&
      !compareDate(
        JSON.parse(log?.description)?.currentDateLocal,
        JSON.parse(log?.description)?.currentDateCustomer
      )
  ).length;

  const syncDatabases = async () => {
    setLoadingRefresh(true);

    setTimeout(() => {
      setLoadingRefresh(false)
      fetchData();
    },  6 * 10000);

    console.log("syc")
    await Api.post("logs/sync").then((res) => {
      console.log("responseLogSync", res);
    });
    
  };


  const fetchData = async () => {
    try {
      setLoading(true);
      setCurrentTime(new Date());
      const response = await Api.get("resume");
      await Api.get(`logs`).then(({ data }) => {
        setLogList(data.docs);
      });

      setData(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const dataPieChart = [
    ["description", "total"],
    ["BD COM ERRO", qtdLogWithError],
    ["BD INCONSISTENTE", qtdLogWithWarning],
    ["BD OK", qtdLogSuccess],
  ];

  const options = {
    slices: {
      0: { color: "#DC3545" },
      1: { color: "#FFC107" },
      2: { color: "#198754" },
    },
    legend: { position: "none" },
  };

  return (
    <Row className="h-100 w-100">
      <Col
        className="col-2 col-md-3 col-sm-4 p-0"
        style={{ maxWidth: "250px" }}
      >
        <MenuOptionsComponents />
      </Col>

      <Col className="col-10 col-md-9 col-sm-8">
        <Row className="d-flex align-items-center dashboard__title">
          <Col className={"row-atualizar"}>
            <Countdown
              date={Date.now() + 30 * 10000}
              zeroPadTime={2}
              onComplete={fetchData}
              overtime={true}
              renderer={(props) => (
                <p>
                  ??LTIMA ATUALIZA????O DO DASHBOARD:{" "}
                  {currentTime.toLocaleString()}
                </p>
              )}
            />
            {loadingRefresh ? (
          <Row style={{ height: "50px", justifyContent: "center" }}>
            <ReactLoading
              type={"spin"}
              color={"#085ED6"}
              height={15}
              width={70}
            />
          </Row>
        ) : (
            <Badge
              className="badge__dashboard"
              style={{ width: "10rem", height: "4.2rem", cursor: " pointer" }}
              bg={"primary"}
              text="white"
              onClick={syncDatabases}
            >
              ATUALIZAR

            </Badge>
            )}
          </Col>
        </Row>
        <Row>
          <Col className="dashboard__items">
            <Badge
              className={"badge__dashboard"}
              bg={"danger"}
              text="white"
              onClick={() => {
                setTypeFilter("Error"),
                  setChart(false);
              }}>
              <span>{qtdLogWithError}</span>
              BD COM ERRO
            </Badge>
            <Badge
              className={"badge__dashboard"}
              bg={"warning"}
              text="gray"
              onClick={() => {
                setTypeFilter("Warning"),
                  setChart(false);
              }}>
              <span style={{ color: "gray" }}>{qtdLogWithWarning}</span>
              <span
                style={{
                  color: "gray",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                BD INCONSISTENTE
              </span>
            </Badge>
            <Badge
              className={"badge__dashboard"}
              bg={"success"}
              text="white"
              onClick={() => {
                setTypeFilter("Success"),
                  setChart(false);
              }}>
              <span>{qtdLogSuccess}</span>
              BD OK
            </Badge>

            <Badge className={"badge__dashboard"} bg={"secondary"} text="white">
              <span>{data?.servers}</span>
              SERVIDOR
            </Badge>
            <Badge
              className={"badge__dashboard"}
              bg={"secondary"}
              text="white"
              onClick={() => {
                setChart(true);
              }}>
              <span>{data?.databases}</span>
              TOTAL BD
            </Badge>
          </Col>
        </Row>
        {loading && (
          <Row style={{ height: "50px", justifyContent: "center" }}>
            <ReactLoading
              type={"bars"}
              color={"#085ED6"}
              height={20}
              width={80}
            />
          </Row>
        )}
        <Row>
          <Col className="col-12">
            {chart && (
              <Chart
                chartType="PieChart"
                data={dataPieChart}
                options={options}
                width="100%"
                height="400px"
              />
            )

            }
            {!chart && (
              <TableFiltered typeFilter={typeFilter} />
            )}
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
