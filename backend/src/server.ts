import patientRoutes from "./routes/patient.routes";
import appointmentRoutes from "./routes/appointment.routes";
import express from "express";

const app = express();

const PORT = 5000;

app.use(express.json());
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "DentaVision AI backend is running",
  });
});

app.listen(PORT, () => {
  console.log(`DentaVision AI backend running on http://localhost:${PORT}`);
});