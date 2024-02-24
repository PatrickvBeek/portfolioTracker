import request from "supertest";
import { TEST_ASSET_LIB, TEST_PORTFOLIO } from "./dataClasses/testUtils";
import app from "./index";

describe("the servers REST api endpoint", () => {
  describe(`/express_backend correctly announces the ${process.env.NODE_ENV} environment`, () => {
    it("/express_backend returns 'connected to test backend'", async () => {
      const response = await request(app).get("/express_backend");
      expect(response.body.express).toEqual(
        `connected to ${process.env.NODE_ENV} backend`
      );
    });
  });

  describe("for assets", () => {
    beforeEach(async () => {
      await request(app).put("/api/assets/save-assets").send({});
    });

    it("/api/assets/get-assets returns a status 200 with empty data initially", async () => {
      const response = await request(app).get("/api/assets/get-assets/");
      expect(response.body).toEqual({});
      expect(response.status).toBe(200);
    });

    it("/api/assets/save-assets is present and sends a status code 200", async () => {
      const response = await request(app)
        .put("/api/assets/save-assets/")
        .send(TEST_ASSET_LIB);
      expect(response.status).toBe(200);
    });

    it("/api/assets/get-assets returns a previously persisted asset map", async () => {
      const putResponse = await request(app)
        .put("/api/assets/save-assets/")
        .send(TEST_ASSET_LIB);
      expect(putResponse.status).toEqual(200);
      const getResponse = await request(app).get("/api/assets/get-assets");
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toEqual(TEST_ASSET_LIB);
    });
  });

  describe("for portfolios", () => {
    const TEST_PORTFOLIO_LIB = { [TEST_PORTFOLIO.name]: TEST_PORTFOLIO };
    beforeEach(async () => {
      await request(app).put("/api/portfolios/save-portfolios").send({});
    });

    it("/api/portfolios/get-portfolios returns a status 200 with empty data initially", async () => {
      const response = await request(app).get("/api/portfolios/get-portfolios");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it("/api/portfolio/save-portfolios returns a status 200", async () => {
      const response = await request(app)
        .put("/api/portfolios/save-portfolios")
        .send(TEST_PORTFOLIO_LIB);
      expect(response.status).toBe(200);
    });

    it("/api/portfolio/get-portfolios returns the previously added portfolio map", async () => {
      const response = await request(app)
        .put("/api/portfolios/save-portfolios")
        .send(TEST_PORTFOLIO_LIB);
      expect(response.status).toBe(200);

      const getResponse = await request(app).get(
        "/api/portfolios/get-portfolios"
      );
      expect(getResponse.status).toBe(200);
      expect(JSON.stringify(getResponse.body)).toEqual(
        JSON.stringify(TEST_PORTFOLIO_LIB)
      );
    });
  });
});
